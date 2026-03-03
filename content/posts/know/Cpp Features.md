---
draft: false

title: "Cpp Features"
description: "在“黑马”原地踏步，来看看 CPP 的新特性"
date: 2025-12-23
author: ["biglonglong"]

tags: ["summary", "cpp", "c++11"]
summary: ""

math: false
weight: 104
cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
    hidden: true

showToc: true
TocOpen: true
comments: true
---



> 我是一个 C++ 初学者，将提供一个 C++ 特性的名称及相关未理解的信息。
> 请你围绕该特性，以“一段精炼说明 + 一段可运行代码”的形式交替输出，要求如下：
>
> - 每段文字仅阐述一个核心点（如语法、用途、限制或使用技巧等）；
> - 每段代码必须最小化、可独立编译运行，并紧贴前文说明，同时明确标注所需标准（如 C++20）；
> - 整体内容应覆盖该特性的关键方面，并对我提供的信息进行必要补充或修正；
> - 禁止冗余：不重复解释、不堆砌背景、不添加总结段落；
> - 对于新引入的语法“糖”，须先清晰说明其语法格式。
>
> 请保持高度紧凑，仅输出必要信息。

## 边界条件

- 空指针  `nullptr`
- 自赋值  `this != other`



## 函数声明修饰符

### explicit

`explicit` 修饰单参数构造函数（或可退化为单参数的构造函数，如带默认参数、模板构造函数），**阻止**编译器在拷贝初始化等上下文中自动调用该构造函数进行**隐式类型转换**，仅允许显式构造或转换。  

```cpp
// C++98
struct A {
    explicit A(int, int = 0) {}
};
int main() {
    A a1(42);      // OK：直接初始化
    // A a2 = 42;  // 错误：拷贝初始化，通过等号创建对象，需隐式转换
    A a3 = A(42);    // OK：显式构造临时对象
}
```

C++11 起，`explicit` 可用于类型转换函数，禁止其禁止隐式转换为目标类型，但允许在布尔上下文（如 `if`、`while` 条件）中使用。  

```cpp
// C++11
struct C {
    explicit operator bool() const { return true; }
};
int main() {
    C c;
    if (c) {}                    // OK：布尔上下文特例
    // if (c == true) {}  		// 错误：隐式转换禁止
    // bool b = c;               // 错误：隐式转换禁止
    bool b = static_cast<bool>(c); // OK：显式转换
}
```

`explicit` 不影响函数参数传递中的显式构造，但会阻止编译器自动将实参隐式转为目标类型。  

```cpp
// C++98
struct D {
    explicit D(double) {}
};
void foo(D) {}
int main() {
    foo(D{3.14});  // OK：显式构造临时对象
    // foo(3.14);  // 错误：不能隐式转换 double → D
}
```

### noexcept

`noexcept` 作为函数说明符，**承诺函数不会抛出异常**；若违反，程序立即终止（调用 `std::terminate()`），而非展开栈。  

```cpp
// C++11
void f() noexcept { throw 1; }
int main() {
    f(); // 程序终止，无异常捕获机会
}
```

`noexcept` 运算符在**编译期检测常量表达式是否被声明为不抛异常**，常用于模板元编程。  

```cpp
// C++11
void g() noexcept {}
void h() {}
static_assert(noexcept(g()), "");
static_assert(!noexcept(h()), "");
```

条件 `noexcept` 允许**根据模板参数或表达式动态决定异常规范**，`noexcept(true)` 承诺函数不会抛出异常（抛出异常时程序终止），`noexcept(false)`函数可能抛出异常，常用于泛型代码以保持异常安全性。  

```cpp
// C++11
template<typename F, typename... Args>
auto call(F&& f, Args&&... args)
    noexcept(noexcept(f(args...))) -> decltype(f(args...)) {
    return f(args...);
}
void foo() noexcept {}
void bar() {}
static_assert(noexcept(call(foo)), "");
static_assert(!noexcept(call(bar)), "");
```

**移动构造函数和移动赋值运算符应尽可能标记为 `noexcept`**，例如标准库容器仅当元素的移动构造函数为 `noexcept` 时才使用移动语义，否则回退到拷贝以保证强异常安全。  

```cpp
// C++11
#include <utility>
struct MoveMayThrow { MoveMayThrow(MoveMayThrow&&) {} };
struct MoveNoThrow { MoveNoThrow(MoveNoThrow&&) noexcept {} };
static_assert(!noexcept(MoveMayThrow(std::declval<MoveMayThrow>())), "");
static_assert(noexcept(MoveNoThrow(std::declval<MoveNoThrow>())), "");
```

析构函数默认为 `noexcept(true)`，显式声明 `noexcept(false)` 虽合法但危险，造成析构不完整。

```cpp
// C++11
struct S1 {
    ~S1() {} // 等价于 ~S1() noexcept
};
static_assert(noexcept(std::declval<S1>().~S1()), ""); // 析构函数默认不抛

struct S2 {
    ~S2() noexcept(false) { throw 1; } // 不推荐
};
int main() {
    // S s; // 析构时抛异常 → terminate
}
```

### const

`const` 修饰成员函数表示**该函数不修改对象的非 mutable 成员**，编译器会强制检查并拒绝任何修改操作，这是因为`const` 成员函数内 `this` 指针类型为 `const T*`，因此所有成员访问都视为 `const` 上下文。  

```cpp
// C++98
struct S {
    int x;
    mutable int cache;
    void f() const {
        // x = 1;      // 错误：this->x = 1; this 是 const S*
        cache++; // OK：mutable 允许修改
    }
};
```

非 `const` 对象可以调用`const` 成员函数和非 `const` 成员函数；`const` 对象只能调用`const` 成员函数。

```cpp
// C++98
struct S {
    void f() const {}
    void g() {}
};
int main() {
    S s;
    const S cs;
    s.f();  // OK
    cs.f(); // OK
    s.g();  // OK
    // cs.g(); // 错误：const 对象不能调用非 const 成员函数
}
```

`const` 正确参与重载决议，允许为 `const` 和非 `const` 对象提供不同行为，如返回不同引用类型。  

```cpp
// C++98
#include <iostream>
struct S {
    int x = 0;
    int& get() { return x; }
    const int& get() const { return x; }
};
int main() {
    S s;
    const S cs;
    s.get() = 1;     // 调用非 const 版本，允许修改
    std::cout << cs.get(); // 调用 const 版本， 不允许修改，因为是常对象调用
}
```



## 基础类型与字面量

###  long long

`long long` 是 C++11 引入的**有符号整数类型**，标准保证其至少 64 位（即能表示 $[-2^{63}, 2^{63}-1]$），但具体大小由实现定义。  

```cpp
// C++11
#include <climits>
static_assert(sizeof(long long) * CHAR_BIT >= 64, "");
std::cout << std::numeric_limits<long long>::max() << std::endl; // 9223372036854775807
```

十进制整型字面量无后缀时，类型按能容纳该值的最小类型依次尝试：`int` → `long` → `long long`（C++11 起）；十六进制或八进制则优先考虑无符号类型。  

```cpp
// C++11
#include <type_traits>
auto x = 9223372036854775807; // 十进制大数 → long long
static_assert(std::is_same_v<decltype(x), long long>, "");
```

字面量后缀 `LL` 或 `ll` 显式指定类型为 `long long`，避免表达式中因操作数为 `int` 导致溢出。  

```cpp
// C++11
long long a = 2147483647 + 1;      // 错误：两个 int 相加溢出
long long b = 2147483647LL + 1;    // 正确：long long 运算
```

`long long` 与 `<cstdint>` 中的 `int64_t` 可能相同，但不保证：`int64_t` 要求恰好 64 位且存在，而 `long long` 至少 64 位，可能更宽（如某些嵌入式平台）。  

```cpp
// C++11
#include <cstdint>
// std::int64_t 可能不存在（若平台无精确 64 位类型）
#ifdef INT64_MAX
static_assert(sizeof(long long) >= sizeof(std::int64_t), "");
std::cout << std::boolalpha
              << std::is_same_v<long long, std::int64_t> << std::endl;
#endif
```

### char_[N]t

> - Unicode（统一码）：全球统一的字符集标准，为每个字符分配唯一的编号（码点）
> - UTF 系列（Unicode 转换格式）：将 Unicode 码点转换为字节序列的编码方案
>   - UTF-8：变长编码，使用 1~4 个字节
>   - UTF-16：变长编码，使用 2 或 4 个字节
>   - UTF-32：定长编码，每个字符固定 4 个字节
> - GBK（中文扩展编码）：中文字符专用编码，非 Unicode 标准
>
> 编译器依据**源文件的编码格式**将**字符字面量**转换为数值表示：
>
> - 对于无前缀的字面量，单字节字符视为 `char` 类型，多字节字符视为 `int` 类型；
> - 对于带前缀的字面量，先将字符数值按照前缀指定的编码格式（如 UTF-8、UTF-16、UTF-32）转换为 **Unicode 码点**，再存储该码点值。
>
> 这要求源文件的实际编码必须与字面量前缀完全匹配（例如 `u8` 前缀要求源文件为 UTF-8 编码），否则行为未定义。
>
> 编译器通常默认源文件为 UTF-8 编码，但可通过编译选项调整此假设。

`char8_t`（C++20）、`char16_t`（C++11）、`char32_t`（C++11）是 **distinct 类型**，分别用于表示 UTF-8、UTF-16、UTF-32 的编码单元。

这些类型本质是底层无符号整数的别名（`typedef unsigned char char8_t`，`typedef uint_least16_t char16_t`，`typedef uint_least32_t char32_t`），但具有独立类型身份，**不与 `char` 隐式互转**，影响着模板推导和函数重载。  

```cpp
// C++20
char8_t a = u8'A';
// char b = a; // 错误：无隐式转换
char b = static_cast<char>(a); // 必须显式转换
```

带前缀的字符字面量（如`u8'X'`、 `u'X'`、`U'X'`）类型分别为`char8_t`、 `char16_t`、`char32_t`，其值为对应 Unicode 码点，而非源文件编码字节。  

```cpp
// C++20
#include <cassert>
static_assert(u'A' == 0x41);   // char16_t
static_assert(U'A' == 0x41);   // char32_t
static_assert(u8'A' == 0x41);  // char8_t
```

多字节字符（如中文）在 `u8` 字面量中仍只能表示单个 UTF-8 编码单元，因此 `u8'牛'` 非法（因“牛”需 2 字节），但 `u8"牛"` 合法（字符串由多个 `char8_t` 组成）。  

```cpp
// C++20
char16_t c16 = u'牛';
char32_t c32 = U'牛';

// char8_t c8 = u8'牛'; // 错误：无法用单个 UTF-8 单元表示
const char8_t* s = u8"牛"; // OK：字符串包含多个 char8_t
char8_t c8 = '牛';      // 0xE7 0x89 0x9B

std::cout << static_cast<int>(c16) << std::endl;                 // 29275
std::cout << static_cast<std::uint_least32_t>(c32) << std::endl; // 29275
std::cout << static_cast<unsigned int>(c8) << std::endl;         // 0x9B
```

标准库 I/O 流未对 `char16_t`/`char32_t`/`char8_t` 提供字符语义重载；需转换为 `char` 序列（如 UTF-8）并以 `const char*` 输出。  

```cpp
// C++20
#include <iostream>
const char8_t* s = u8"Hello";
std::cout << reinterpret_cast<const char*>(s) << '\n';
```

输出字符时，需确保其编码格式与输出流的编码保持一致。UTF 系列编码在设计上具有向前的兼容性，其中部分字符的编码值在不同版本中保持一致。

```cpp
// C++11
#include <iostream>
#include <locale>
#include <codecvt>
#include <string>
int main() {
    char16_t c16 = u'牛';
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> conv;
    std::string utf8 = conv.to_bytes(c16);
    std::cout << utf8 << std::endl; // 牛
}
```

### nullptr 与 NULL

`nullptr` 是 C++11 引入的类型安全**空指针字面量**，其类型为 `std::nullptr_t`，可**隐式转换为任意指针类型（包括成员指针）**，但**不能转换为整数类型或参与算术运算**。

```cpp
// C++11
int* p = nullptr;
void (X::*pmf)() = nullptr;
// int x = nullptr; // 错误
```

`NULL` 在 C++ 中通常定义为整型常量 `0`，其类型为通常推导为`int`，在重载解析中**优先匹配整数参数而非指针**，易引发非预期调用。

```cpp
// C++11
void f(int); void f(char*);
f(NULL);     // 调用 f(int)
f(nullptr);  // 调用 f(char*)
```

`std::nullptr_t` 可作为函数参数类型，专门接受 `nullptr` 字面量，实现精确重载区分。

```cpp
// C++11
#include <cstddef>
void g(std::nullptr_t); void g(int*);

g(nullptr);   // 调用 g(std::nullptr_t)
int* q = nullptr;
g(q);          // 调用 g(int*)
```

`nullptr` 与指针类型的比较是合法且明确的；而与**非零整数比较则被禁止**，避免了语义混淆。

```cpp
// C++11
int* p = nullptr;
if (p == nullptr) {}   // OK
// if (p == 1) {}      // 错误：不能与非空指针常量整数比较
if (p == 0) {}         // OK：0 是有效的空指针常量（但不推荐）
```

### 函数指针

函数指针是**一种指向函数的变量**，其类型由返回类型和参数列表唯一确定，与所指向函数的名字无关。

```cpp
// C++98
int square(int x) { return x * x; }
int (*func_ptr)(int) = square;   // 函数指针
int *func_ptr(int);    // 返回类型为指针的函数声明
```

函数指针可通过函数名直接初始化，并支持两种等效调用语法：直接调用或显式解引用后调用。

```cpp
// C++98
int add_one(int x) { return x + 1; }
int (*fp)(int) = add_one;
int a = fp(5);      // 直接调用
int b = (*fp)(5);   // 显式解引用后调用
```

函数指针可隐式转换为 `bool`，便于检查是否为空（即未绑定任何函数），常用于安全调用前的判断。

```cpp
// C++11
void greet() {}
void (*fp)() = nullptr;
if (!fp) { /* handle null */ }
fp = greet;
if (fp) fp(); // safe call
```

函数指针类型可通过 `typedef` 或 `using` 定义别名，便于作为参数或返回类型使用。

```cpp
// C++11
// typedef int (*BinOp)(int, int);   // C 风格
using BinOp = int (*)(int, int); // C++ 11

BinOp select_op(char c) 
// int (*select_op(char op))(int, int)
// auto select_op(char op) -> int (*)(int, int)
{
    return (c == '+') ? [](int a, int b) { return a + b; } : nullptr;
}
```

**函数指针数组**可用于实现分发表，根据索引快速调用不同函数，适用于状态机或命令模式。

```cpp
// C++98
int op0(int a, int b) {return a + b;}
int op1(int a, int b) {return a - b;}

using DispatchFunc = int (*)(int, int);
DispatchFunc dispatch_table[2] = {op0, op1};
// int (*dispatch_table[2])(int, int) = {op0, op1};

int result = dispatch_table[1](10, 3);
```

普通函数指针不能指向类的非静态成员函数，需使用成员函数指针，并配合对象或指针调用。

```cpp
// C++98
struct Math {
    int mul(int x) { return x * 2; }
};
int (Math::*mp)(int) = &Math::mul; // 成员函数指针
Math m;
(m.*mp)(5);          // 成员函数指针调用
```



## 语法“糖”

### 基于范围的for循环

基于范围的 for 循环语法格式为：

```markdown
for (init_st ; range_decl : range_exp) {loop_body}
```

其中 `range_declaration` 声明用于每次迭代的变量，`range_expression` 必须是数组、或提供可调用的 `begin()`和`end()`（成员或非成员，通过 ADL 可见）。

```cpp
// C++11
#include <iostream>
#include <vector>
struct Range {
    int data[3] = {1, 2, 3};
    int *begin() { return data; }
    int *end() { return data + 3; }
};
int main() {
    Range r;
    for (int x : r) std::cout << x << ' '; // 输出 1 2 3
}
```

C++17 起允许在循环前加 `init_st`初始化表达式或声明，作用域限于整个 for 循环。

```cpp
// C++17
#include <map>
#include <iostream>
int main() {
    for (std::map<int, char> m{{1,'a'},{2,'b'}}; const auto& p : m) {
        std::cout << p.first << ':' << p.second << ' ';
    }
}
```

若 `range_declaration` 使用值类型（如 `auto` 或 `T`），会触发元素复制；对不可复制或昂贵复制的对象，应使用引用（`const auto&` 读取，`auto&` 修改，`auto&&` 通用引用）。

```cpp
// C++11
#include <string>
#include <vector>
#include <iostream>
int main() {
    std::vector<std::string> words{"copy", "ref"};
    for (auto s : words) std::cout << s << ' ';       // 复制
    for (const auto& s : words) std::cout << s << ' '; // 无复制
}
```

基于范围的 for 循环展开后等价于使用 `begin()` 和 `end()` 的传统迭代器循环，因此**禁止在循环中改变容器结构**（如 `push_back`、`erase`），否则可能导致迭代器失效和未定义行为。

```cpp
// C++11
#include <vector>
int main() {
    std::vector<int> v{1, 2, 3};
    for (auto& x : v) {
        // v.push_back(4); // 危险：可能使迭代器失效
        x *= 2; // OK：仅修改元素值
    }
}
```

### 支持初始化的if和switch

C++17 起，`if` 和 `switch` 语句支持在条件前嵌入一条初始化语句，**初始化语句必须是单条声明（如变量定义）或空语句，不能是表达式（函数调用），其作用域覆盖整个控制结构及其所有分支**。

```cpp
// C++17
#include <iostream>
int main() {
    if (int x = 10; x > 5) {
        std::cout << x << '\n'; // 输出 10
    }
    // x 在此处不可见
}
```

该特性常用于将 RAII 对象的作用域精确限定在条件判断及执行块内，避免资源泄漏或延长生命周期。

```cpp
// C++17
#include <memory>
#include <iostream>
bool check() { return true; }
int main() {
    if (auto ptr = std::make_unique<int>(42); check()) {
        std::cout << *ptr << '\n';
    }
    // ptr 自动析构
}
```

`switch` 中的初始化语句使临时值或资源可在所有 `case` 标签中安全使用，且保证在 `switch` 结束时销毁。

```cpp
// C++17
#include <iostream>
int getValue() { return 3; }
int main() {
    switch (int n = getValue(); n) {
        case 1: std::cout << "One\n"; break;
        case 3: std::cout << "Three\n"; break;
        default: std::cout << "Other\n";
    }
    // n 在此处不可见
}
```



## 智能指针

> 在 C++ 中，对象的存储位置直接影响其生命周期和作用域。栈上的对象遵循严格的作用域规则，当离开其定义的作用域（如函数返回、代码块结束）时，会被自动销毁，这虽然保证了内存安全，但也限制了对象的生存周期。
>
> 相比之下，在堆上动态分配对象，则赋予了程序员更精细的控制权：
>
> 1. **生命周期的自主管理**：不依赖于作用域，而是由显式的 `new` 和 `delete`决定，这使得**对象可以跨越函数、甚至线程边界存在**，适合构建长期存活的数据结构或资源共享模型。
> 2. **灵活的内存分配**：**堆空间通常远大于栈**，允许创建大型对象或数量众多的对象，而不会引发栈溢出。同时，堆分配的大小可以在**运行时动态决定**，支持按需分配和弹性扩展。
>
> 虽然堆分配增强了灵活性，但也引入了风险。
>
> - 内存泄漏：如果使用 `new` 分配了内存，却没有在适当的时候使用 `delete` 进行释放或者异常中止，这部分内存将永久无法被程序再次使用。随着程序运行，泄漏的内存会不断累积，最终可能导致程序因内存耗尽而崩溃。
> - 悬挂指针/野指针：当一块堆内存被 `delete` 后，指向它的指针并不会自动变为 `nullptr`。如果后续继续通过这个指针访问或操作内存，行为是未定义的，通常会导致程序崩溃（段错误）或数据损坏，且这类错误难以调试。
> - 双重释放：对同一块堆内存进行多次 `delete` 操作。这会导致堆管理数据结构被破坏，同样引发未定义行为，往往是程序立即崩溃。
>
> 现代 C++ 鼓励使用智能指针（`std::unique_ptr`、`std::shared_ptr`）自动管理动态分配内存，通过RAII 机制，**将堆对象的生命周期与栈上变量作用域绑定**，在其首次构造时申请资源，在其最终析构时释放资源。

`std::unique_ptr`，独占指针， 独占所有权，禁止复制但允许移动，确保同一时间仅有一个指针拥有资源，适用于明确所有权转移的场景。

```cpp
// C++11
#include <iostream>
#include <memory>

int main() {
    std::unique_ptr<int> a = std::make_unique<int>(10);
    std::cout << *a << "\n"; // 输出 10
    // std::unique_ptr<int> q = a;  // 错误：不可复制
    std::unique_ptr<int> b = std::move(a);
    if (!a) std::cout << "a is null\n"; // 输出 a is null
}
```

`std::shared_ptr` ，共享指针，通过**引用计数**实现共享所有权，多个 shared_ptr 可指向同一对象。

使用同一个计数器，构造shared_ptr时增加计数，析构时减少计数，最后一个销毁时释放资源。但存在控制块，本身有开销。

```cpp
// C++11
#include <iostream>
#include <memory>

int main() {
    std::shared_ptr<int> p1 = std::make_shared<int>(10);
    std::cout << p1.use_count() << '\n'; // 1
    {
        std::shared_ptr<int> p2 = p1;
        std::cout << p1.use_count() << '\n'; // 2
    }
    std::cout << p1.use_count() << '\n'; // 1
}
```

**循环引用**会使 `shared_ptr` 的引用计数永不归零，导致内存泄漏；应升级为 `std::weak_ptr`， 观察指针，不参与强引用计数（控制生命周期），仅仅增长弱引用计数（），打破循环。

```cpp
// C++11
#include <memory>

struct Node {
    std::shared_ptr<Node> next; // strong_ref_count
    std::weak_ptr<Node> prev;   // weak_ref_count
};

int main() {
    auto a = std::make_shared<Node>(); // a: strong_ref_count = 1, weak_ref_count = 0
    auto b = std::make_shared<Node>(); // b: strong_ref_count = 1, weak_ref_count = 0
    a->next = b;                       // b: strong_ref_count = 2, weak_ref_count = 0
    b->prev = a;                       // a: strong_ref_count = 1, weak_ref_count = 1
}
// destory b -> b: strong_ref_count = 1, weak_ref_count = 0
// destory a -> a: strong_ref_count = 0, weak_ref_count = 1，触发 a-Node 的析构函数
//  - destory a-Node.next -> b: strong_ref_count = 0, weak_ref_count = 0， 触发 b-Node 的析构函数

```

`std::weak_ptr` 不能直接解引用，必须通过 `lock()` 转为 `shared_ptr` 来安全访问对象，防止访问已销毁资源。

```cpp
// C++11
#include <iostream>
#include <memory>

int main() {
    auto sp = std::make_shared<int>(42);         // strong_ref_count = 1
    std::weak_ptr<int> wp = sp;                  // weak_ref_count = 1
    if (auto locked = wp.lock()) {               // strong_ref_count = 2
        std::cout << locked.use_count() << '\n'; // 输出 2
    }
    std::cout << sp.use_count() << '\n'; // 输出 1

    sp.reset(); // strong_ref_count = 0, 对象被销毁
    if (auto locked = wp.lock()) {
        std::cout << locked.use_count() << '\n';
    } else {
        std::cout << "对象已被销毁\n";
    }
}
```

`std::make_shared` （C++11）和 `std::make_unique` （C++14）是创建智能指针的推荐方式

- 一次内存分配中，同时分配对象本体和控制块（如引用计数），提高缓存块（单块而非双块）命中率；
- 将对象本体资源申请和控制块资源申请合并为一个原子操作，避免出现异常带来的内存泄漏等问题；
- 避开未定义行为（使用相同的原始裸指针初始化智能指针）导致的双重析构和计数错误。

```cpp
// C++11
#include <iostream>
#include <memory>

int main() {
    // 未定义行为：不要使用相同的原始指针初始化智能指针，这会导致双重析构
    int *resource = new int(42);
    std::shared_ptr<int> ep1(resource);
    std::shared_ptr<int> ep2(resource);
    std::cout << "ep1's ref count: " << ep1.use_count() << std::endl;
    std::cout << "ep2's ref count: " << ep2.use_count() << std::endl;

    std::shared_ptr<int> rp1 = std::make_shared<int>(42);
    std::shared_ptr<int> rp2 = rp1;
    std::cout << "rp1's ref count: " << rp1.use_count() << std::endl;
    std::cout << "rp2's ref count: " << rp2.use_count() << std::endl;
    return 0;
}
```

`std::unique_ptr` 可绑定自定义删除器，用于管理非 `new` 分配的资源（如文件句柄、C 库对象等）。

```cpp
// C++11
#include <memory>
#include <cstdio>

int main() {
    auto file_deleter = [](FILE* f) { std::fclose(f); };
    std::unique_ptr<FILE, decltype(file_deleter)> fp(std::fopen("tmp.txt", "w"), file_deleter);
    if (fp) std::fputs("data", fp.get());
}
```

手动实现`std::shared_ptr`、`std::unique_ptr`，不考虑多线程、原子操作、双重析构（未定义行为）

```cpp
#include <assert.h>
#include <iostream>

template <typename T>
class SharedPtr {
private:
    T *ptr_;         // point to the managed resource, nullptr means no resource is held
    int *ref_count_; // reference count, nullptr means no resource is held

    void release() {
        if (ref_count_ && --(*ref_count_) == 0) {
            delete ptr_;
            delete ref_count_;
        }
        ptr_ = nullptr;
        ref_count_ = nullptr;
    }
public:
    // init contrsuctor
    explicit SharedPtr(T *raw_ptr = nullptr)
        : ptr_(raw_ptr), ref_count_(raw_ptr ? new int(1) : nullptr) {}

    // copy constructor
    SharedPtr(const SharedPtr &other) : ptr_(other.ptr_), ref_count_(other.ref_count_) {
        if (ref_count_) ++(*ref_count_);
    }

    // move constructor
    SharedPtr(SharedPtr &&other) noexcept : ptr_(other.ptr_), ref_count_(other.ref_count_) {
        other.ptr_ = nullptr;
        other.ref_count_ = nullptr;
    }

    // copy assignment
    SharedPtr &operator=(const SharedPtr &other) {
        if (this != &other) {
            release();
            ptr_ = other.ptr_;
            ref_count_ = other.ref_count_;
            if (ref_count_) ++(*ref_count_);
        }
        return *this;
    }

    // move assignment
    SharedPtr &operator=(SharedPtr &&other) noexcept {
        if (this != &other) {
            release();
            ptr_ = other.ptr_;
            ref_count_ = other.ref_count_;
            other.ptr_ = nullptr;
            other.ref_count_ = nullptr;
        }
        return *this;
    }

    ~SharedPtr() { release(); }

    // use_count
    int use_count() const { return ref_count_ ? *ref_count_ : 0; }
    bool unique() const { return use_count() == 1; }

    // operator reload
    T &operator*() const { return *ptr_; }
    T *operator->() const { return ptr_; }
    T *get() const { return ptr_; }

    // reset
    void reset(T *raw_ptr = nullptr) {
        if (ptr_ != raw_ptr) {
            release();
            ptr_ = raw_ptr;
            ref_count_ = raw_ptr ? new int(1) : nullptr;
        }
    }

    explicit operator bool() const { return ptr_ != nullptr; }
};

template <typename T>
class UniquePtr {
private:
    T *ptr_;

    void release() {
        delete ptr_;
        ptr_ = nullptr;
    }
public:
    explicit UniquePtr(T *raw_ptr = nullptr) : ptr_(raw_ptr) {}

    UniquePtr(const UniquePtr &) = delete;

    UniquePtr(UniquePtr &&other) noexcept : ptr_(other.ptr_) { other.ptr_ = nullptr; }

    UniquePtr &operator=(const UniquePtr &) = delete;

    UniquePtr &operator=(UniquePtr &&other) {
        if (this != &other) {
            release();
            ptr_ = other.ptr_;
            other.ptr_ = nullptr;
        }
        return *this;
    }

    ~UniquePtr() { release(); }

    T &operator*() const { return *ptr_; }
    T *operator->() const { return ptr_; }
    T *get() const { return ptr_; }

    void reset(T *raw_ptr = nullptr) {
        if (ptr_ != raw_ptr) {
            release();
            ptr_ = raw_ptr;
        }
    }

    T *pop() {
        T *temp = ptr_;
        ptr_ = nullptr;
        return temp;
    }

    explicit operator bool() const { return ptr_ != nullptr; }
};

template <typename T, typename... Args>
SharedPtr<T> MakeShared(Args &&...args) {
    return SharedPtr<T>(new T(std::forward<Args>(args)...));
}

template <typename T, typename... Args>
UniquePtr<T> MakeUnique(Args &&...args) {
    return UniquePtr<T>(new T(std::forward<Args>(args)...));
}

class Demo {
public:
    int x = 1;
    int y = 2;
};

void test_shared_ptr() {
    SharedPtr<Demo> p(new Demo());
    assert(bool(p) && p->y == 2 && (*p).x == 1);

    // copy constructor
    SharedPtr<Demo> p2 = p;
    SharedPtr<Demo> p3 = p2;
    assert(p.use_count() == 3);

    // move constructor
    SharedPtr<Demo> p4 = std::move(p);
    assert(!bool(p) && p4.use_count() == 3);

    SharedPtr<Demo> a, b;
    a = b = p4;
    assert(a.use_count() == 5); // p2, p3, p4, a, b

    // reset
    p2.reset();
    p3.reset(p3.get());
    assert(bool(p3) && p3.use_count() == 4); // p3, p4, a, b

    // empty
    SharedPtr<Demo> empty;
    assert(!bool(empty) && empty.use_count() == 0);

    // MakeShared
    auto p5 = MakeShared<Demo>();
    assert(bool(p5) && p5.use_count() == 1);

    std::cout << "All tests passed!" << std::endl;
}

int main() {
    test_shared_ptr();
    return 0;
}
```









## 扩展的聚合类型

聚合类型必须没有用户声明的构造函数（包括`=default`或`=delete`的构造函数），但可包含默认生成的特殊成员函数。  

```cpp
// C++17
struct A {
    int x;
    // A() = default; // 若显式声明，则不再是聚合类型（C++17及以前）
};
int main() {
    A a{42}; // OK
}
```

聚合类型的所有非静态数据成员必须是 public 的；若存在基类，则基类也必须是 public、非 virtual，且本身是聚合类型（C++17 起支持基类聚合初始化）。  

```cpp
// C++17
struct Base { int a; };
struct Derived : Base {
    int b;
};
int main() {
    Derived d{{1}, 2}; // 基类子对象用 {1} 初始化
}
```

自 C++20 起，聚合类型允许拥有用户声明但为 defaulted 且非 constexpr 的默认构造函数，放宽了限制。  

```cpp
// C++20
struct B {
    int x;
    B() = default; // C++20 允许，仍为聚合类型
};
int main() {
    B b{.x = 1}; // 聚合初始化 OK
}
```

聚合初始化使用花括号列表按声明顺序逐成员初始化，不调用构造函数；若初始值数量少于成员数，剩余成员进行默认初始化（若可能）。  

```cpp
// C++11
struct Point { int x = 0; double y = 0.0; };
int main() {
    Point p{3}; // x=3, y=0.0
}
```

C++20 引入指定初始化器（designated initializers），允许按成员名初始化聚合类型，提升可读性和灵活性。  

```cpp
// C++20
struct Config { bool flag; int count; };
int main() {
    Config c{.count = 42, .flag = true}; // 顺序无关
}
```



## 确定表达式的求值顺序



## 类型别名和别名模板

`typedef` 无法直接定义别名模板；它只能为具体类型创建别名，不能接受模板参数。C++11 引入的 `using` 语法才支持别名模板。

```cpp
// C++11
#include <map>
template<typename T>
using int_map = std::map<int, T>; // 正确：别名模板
int_map<std::string> m;           // 等价于 std::map<int, std::string>
```

若强行用 `typedef` 模拟模板别名，需将其嵌套在类模板内部，但这不是真正的别名模板，使用繁琐且不等效。

```cpp
// C++98 workaround（非别名模板）
template<typename T>
struct int_map_helper {
    typedef std::map<int, T> type;
};
int_map_helper<std::string>::type m; // 冗长，且不能直接用于模板模板参数
```

别名模板可完美转发模板参数，包括非类型参数和可变参数，而 `typedef` 完全不具备此能力。

```cpp
// C++11
template<typename T, size_t N>
using array_t = T[N];

template<typename... Ts>
using tuple_t = std::tuple<Ts...>;

array_t<int, 5> arr;
tuple_t<int, double> tup;
```

别名模板在模板元编程中保持透明性：其自身不引入新类型，`is_same_v<alias<T>, original<T>>` 为 `true`。

```cpp
// C++11
#include <type_traits>
template<typename T> using ptr = T*;
static_assert(std::is_same_v<ptr<int>, int*>);
```

函数指针或成员指针的别名用 `using` 更清晰，尤其涉及模板时 `typedef` 语法易混淆且无法泛化。

```cpp
// C++11
template<typename R, typename A>
using func_ptr = R(*)(A);

func_ptr<void, int> f; // 等价于 void (*f)(int);
// typedef 无法写出等效的模板形式
```



## auto 占位符

`auto` 在变量声明中触发**编译时**类型推导，要求必须有**初始化表达式**，且推导出的类型不保留顶层 `const` 或引用，除非显式指定。

```cpp
// C++11
#include <initializer_list>

int main() {
    auto x = 5;               // int
    auto y = 3.14;            // double
    auto str = "Hello, AUTO"; // const char*

    const auto m = x;  // const int
    auto &n = x;       // int&
    const auto &q = x; // const int&

    const int ci = 42;
    auto a = ci;  // a is int
    auto &b = ci; // b is const int&
    auto c = &ci; // c is const int*

    int arr[5] = {1, 2, 3, 4, 5};
    auto d = arr;  // int*
    auto &e = arr; // int (&)[5]

    auto f{42};    // int
    auto g = {42}; // std::initializer_list<int>
    auto h(42);    // int
}
```

多变量声明中使用 `auto` 要求所有初始化表达式推导出相同类型，否则编译失败，因为 `auto` 在声明中仅从左到右推导一次。

```cpp
// C++11
int main() {
    // auto x = 1, y = 3.14; // error: deduced as int from x, conflicts with double for y
    auto a = 1, b = 2;        // OK: both int
}
```

三元运算符 `?:` 的类型由其两个操作数的公共类型决定，遵循常规算术类型转换，`auto` 接收该结果类型。

```cpp
// C++11
int main() {
    auto x = true ? 1 : 4.2; // x is double (common type of int and double)
    static_assert(std::is_same_v<decltype(x), double>);
}
```

非静态数据成员不能使用 `auto`，因其类型必须在类定义中显式可知。

```cpp
// C++11
struct A {
    // auto a = 1; // error: non-static member cannot use 'auto'
    static constexpr auto b = 1; // OK: static constexpr allowed
};
```

`auto` 可用于迭代器声明，避免冗长的类型名，提升可读性且类型安全。

```cpp
// C++11
#include <vector>
#include <iostream>
int main() {
    std::vector<int> vec = {1, 2, 3};
    for (auto it = vec.begin(); it != vec.end(); ++it) {
        std::cout << *it << ' ';
    }
}
```

`auto` 可接收 lambda 表达式，因为每个 lambda 有唯一的、编译器生成的闭包类型，`auto` 能精确捕获该匿名类型。

```cpp
// C++11
int main() {
    auto f = [](int x) { return x * 2; };
    // f's type is unique, unnamed closure type
    static_assert(!std::is_same_v<decltype(f), std::function<int(int)>>);
    auto x = f(1);
}
```

尾置返回类型（trailing return type）使用 `decltype` 显式指定返回类型，此时 `auto` 仅作语法占位符，不触发自动推导。

```cpp
// C++11
auto sum(int a, int b) -> decltype(a + b) {
    return a + b; // return type is int, as decltype(a + b) == int
}
```

在结构化绑定中，`auto` 作用于整个被解构对象，每个绑定变量的类型由对应成员决定。

```cpp
// C++17
#include <utility>
int main() {
    std::pair<int, const double> p{1, 3.14};
    auto [x, y] = p;        // x is int, y is const double
    const auto& [x2, y2] = p; // x2 is const int&, y2 is const double&
}
```

作为函数返回类型时，`auto` 允许编译器从 `return` 表达式推导返回类型，但所有使用该函数的 `return` 语句必须推导出同一类型。

```cpp
// C++14
auto add(int a, int b) {
    return a + b; // return type deduced as int
}
```

lambda 表达式中，参数使用 `auto` 自 C++14 起合法，生成泛型 lambda，等价于带模板的函数对象。

```cpp
// C++14
int main() {
    auto f = [](auto a, auto b) { return a + b; };
    f(1, 2);     // OK: int + int
    f(1.5, 2.5); // OK: double + double
}
```

`auto` 可用于非类型模板参数（NTTP），使模板能接受任意常量表达式类型，自 C++17 起支持。

```cpp
// C++17
template<auto N>
constexpr auto value = N;

int main() {
    static_assert(value<42> == 42);
    static_assert(value<true> == true);
}
```

C++20 起 `auto`  可用于普通函数参数中，等价于模板参数。

```cpp
// C++20
auto square(auto x) {
    return x * x;
}
// equivalent to: template<typename T> auto square(T x) { return x * x; }
```







## decltype 说明符

`decltype` 是 C++11 引入的类型说明符，用于在编译期推导表达式的声明类型（declared type），但不实际计算表达式的值。

```cpp
// C++11
int x = 0;
decltype(x) y = x; // y is int
```

对无括号的标识符，`decltype` 返回其声明类型，保留 `const` 和引用。

```cpp
// C++11
const int ci = 42;
int& ri = ci;
decltype(ci) a = 42; // const int
decltype(ri) b = ci; // int&
```

对带括号的标识符或任何左值表达式，`decltype` 推导为左值引用类型。

```cpp
// C++11
int x = 0;
decltype((x)) r = x; // int&, because (x) is an lvalue expression
```

对纯右值表达式，`decltype` 推导为非引用类型。

```cpp
// C++11
int f();
decltype(f()) a;     // int (assuming f returns int by value)
decltype(42) b;      // int
decltype(1 + 2) c;   // int
```

对后缀自增/自减（如 `x++`），因其返回右值，`decltype` 推导为非引用类型；而前缀版本返回左值引用。

```cpp
// C++11
int x = 0;
decltype(x++) a; // int (rvalue)
decltype(++x) b; // int& (lvalue)
```

`decltype(auto)` 在 C++14 中引入，结合 `auto` 的占位符语义与 `decltype` 的精确类型推导规则，常用于转发场景。

```cpp
// C++14
const int cx = 42;
int& rx = const_cast<int&>(cx);
decltype(auto) v1 = cx; // const int
decltype(auto) v2 = rx; // int&
```



## 常量表达式constexpr

常量表达式（编译时性能优化），



## 右值引用

> 判断左右值：（判断对象取地址，能取地址为左值，反之为右值）
>
> - 左值一般指一个指向特定内存的具名对象，具有较长的生命周期；
> - 右值一般指一个不指向稳定内存的匿名对象，生命周期很短
>   - 纯右值：用于初始化，无内存地址，如字面量、算术表达式
>   - 将亡值：即将被移动，资源可重用，如返回非引用的函数调用

右值引用必须绑定右值，延迟其生命周期，减少copy，提高程序性能。

```cpp
// C++11
int&& r = 42; // 纯右值
string make_str()
{
    string s = "Hello";
    return s;
}
string &&rrs = make_str(); // 将亡值，2次构造，比直接赋值减少一次
```

右值引用不能直接绑定到左值，但可通过 `std::move` 或 `static_cast<T&&>` 显式转换为右值，实现**移动语义**。

```cpp
// C++11
int x = 1;
int&& r = std::move(x); // OK: x treated as rvalue
int && r_ = static_cast<std::remove_reference<decltype(x)>::type &&>(x);
```

右值引用本身是具名对象，在其作用域内是左值，需再次 `std::move` 才能传递为右值。

```cpp
// C++11
void f(int&& x) {
    int&& y = x;      // error: x is lvalue
    int&& z = std::move(x); // OK
}
```

普通左值引用必须绑定左值，常量左值引用可绑定左值或右值，延长临时对象生命周期，常用于拷贝构造函数参数，以避免拷贝构造递归，同时还增添以右值拷贝构造的特性。

```cpp
// C++11
const int& a = 5; // OK
int&& b = 5;      // OK
int& c = 5;       // error

class Person {
    char *database;
public:
    Person(const Person &p) {
        // new a Person
        database = new char[100]; // example allocation
        memcpy(database, p.database, 100);
        cout << "lValue/rValue copy constructor called" << endl;
    }
};
```

右值引用引入移动构造函数，将资源从源对象“窃取”并置空，避免双重释放。

```cpp
// C++11
class Person {
    char *database;
public:
    Person(Person &&rrp) {
        // move a Person
        database = rrp.database;
        rrp.database = nullptr;
        cout << "rValue copy constructor called" << endl;
    }
};
```

在用户未声明的前提下，编译器：

1. 总是自动生成析构函数；
2. 无任何用户声明的构造函数，自动生成默认构造函数；
3. 无用户声明的拷贝构造和拷贝赋值，自动生成拷贝构造函数和拷贝赋值运算符
4. 无用户声明的构造函数和析构函数，自动生成移动构造函数和移动赋值运算符

```cpp
// C++11
struct S {
    std::string s;
    // move ctor auto-generated if no user-declared copy/move/dtor
};
```

当用户自定义移动构造函数时，必须确保**完整地转移**源对象的资源，并明确：**构造完成后，源对象应处于有效但未指定的状态（通常为空或可析构状态），其原有内容已由新对象接管。**



## 万能引用

万能引用（universal reference）仅在模板参数推导或 `auto` 推导中出现，形式为 `T&&` 或 `auto &&`；它不是独立的引用类型，而是左值引用或右值引用的统称。

```cpp
template<typename T>
void f(T&& x); // C++11

int main() {
    int a = 0;
    f(a);      // T = int&, x is int&
    f(42);     // T = int,  x is int&&
}
```

当实参为左值时，`T` 被推导为左值引用类型，`T&&` 折叠为 `T&`；当实参为右值时，`T` 被推导为非引用类型，`T&&` 保持为右值引用。

```cpp
#include <type_traits>

template <typename T>
void check(T &&x) {
    // static_assert(std::is_same_v<decltype(x), int &>, "T && should be deduced as int&");
    static_assert(std::is_same_v<decltype(x), int &&>, "T && should be deduced as int&&");
}

int main() {
    int x{};
    // check(x); // T = int&
    check(42); // T = int&&
}
```

万能引用必须直接使用未修饰的 `T&&` 形式；若 `T` 被限定（如 `const T&&`）或出现在非推导上下文（如函数参数无模板），则不再是万能引用。

```cpp
template<typename T>
void f(const T&& x); // not universal reference — always rvalue reference

int main() {
    int a = 0;
    // f(a); // error: cannot bind lvalue to const int&&
    f(42);   // OK
} // C++11
```

`auto&&` 在变量声明中也构成万能引用，可自动适配初始化表达式的值类别（左值/右值），常用于范围 for 循环或泛型 lambda 中。

```cpp
#include <iostream>

int main() {
    int x = 42;
    auto&& r1 = x;     // r1 is int&
    auto&& r2 = 42;    // r2 is int&&
    std::cout << r1 << ' ' << r2 << '\n';
} // C++11
```

转发过程中，以常规变量作参数，会形成一次构造，以引用变量作参数，无法处理右值实参；以常量引用作参数，会受`const`限定符约束。。。

**完美转发**依赖万能引用和 `std::forward<T>(t)`，后者根据 `T` 的原始推导类型恢复值类别；直接使用 `static_cast<T&&>(t)` 等价但不推荐。

```cpp
#include <utility>

template<typename T>
void wrapper(T&& arg) {
    other_func(std::forward<T>(arg)); // preserves value category
}

void other_func(int&) { }
void other_func(int&&) { }

int main() {
    int x = 0;
    wrapper(x);   // calls other_func(int&)
    wrapper(42);  // calls other_func(int&&)
} // C++11
```

万能引用优先级高于 const 引用重载，可能导致意外匹配；可通过 SFINAE 或重载限制避免。

```cpp
#include <iostream>

void f(const int&) { std::cout << "const ref\n"; }
template<typename T> void f(T&&) { std::cout << "universal ref\n"; }

int main() {
    const int c = 0;
    f(c); // prints "universal ref", not "const ref"
} // C++11
```



## Lambda 表达式

```markdown
[captures]<typname T>(params) specifiers exception -> ret {body}
```

Lambda 表达式是一种定义**匿名函数对象**的语法，其本质是编译器生成的唯一闭包类型。  

```cpp
// C++11
auto f = []{ return 42; };
static_assert(!std::is_same_v<decltype(f), void(*)()>);
```

捕获列表决定如何访问外部作用域（ Lambda 表达式所处函数及其函数体）非静态局部变量：`[=]` 值捕获、`[&]` 引用捕获，混合形式需注意默认模式在前。  

```cpp
// C++11
int x = 1, y = 2;
auto lam = [=, &y]{ ++y; return x + y; };
lam(); // x 不变，y 增加
```

Lambda 默认以值捕获的成员为 `const`，若需修改须加 `mutable`，但不影响外部变量。  

```cpp
// C++11
int x = 1;
auto lam = [x]() mutable { ++x; return x; };
lam(); // 返回 2，外部 x 仍为 1
```

异常说明符（如 `noexcept`）可显式指定 `operator()` 的异常规范。  

```cpp
// C++11
auto safe = []() noexcept { };
auto unsafe = []() { throw 1; };
static_assert(noexcept(safe()));
static_assert(!noexcept(unsafe()));
```

无捕获 Lambda 可转换为函数指针，便于与 C 风格接口交互。  

```cpp
// C++11
void call_func(int(*f)()) { f(); }
call_func([]{ return 0; }); // OK
```

C++20 起允许 Lambda 在非局部作用域中捕获 `*this`（通过 `[=, *this]`），实现值语义的成员访问。  

```cpp
// C++20
struct S {
    int val = 42;
    auto get_lambda() {
        return [=, *this] { return val; };
    }
};
S{}.get_lambda()(); // 返回 42，不依赖原对象存活
```

C++14 起支持泛型 Lambda，参数使用 `auto`，等价于模板 `operator()`。  

```cpp
// C++14
auto add = [](auto a, auto b) { return a + b; };
static_assert(add(1, 2) == 3);
static_assert(add(1.5, 2.5) == 4.0);
```



## const 修饰

向编译器和其他程序员承诺，这个值/对象不会改变，定义时必须初始化；不能将const 修饰变量非 const 化

### with 指针

- `const int *p1 = &a`/`int const *p1 = &a`：指向常量的指针，指针指向可以改，指针指向的值不可以更改
- `int *const p2 = &a`：指针常量，指针指向不可以改，指针指向的值可以更改
- `const int *const p1 = &a`：指向常量的常量指针，指针指向不可以改，指针指向的值不可以更改

### const 引用

- `const int &p1 = &a`/`int const &p1 = &a`：常量引用，引用常量值，可以初始化为临时对象或字面量

### with 函数

- `void print(const string& str)`：常量参数，不能被修改，提高安全性
- `const string& getName()`：常量返回值引用，防止返回值被修改
- `string getName() const{}`：const成员函数，承诺不修改对象状态，mutable成员变量除外

### with 对象

- `const Student s("Alice");`：const 对象，只能调用const函数
- `const double PI = 3.1415926;`：const 成员变量，直接初始化或者构造函数列表初始化，不能再构造函数中初始化

### constexpr

编译期常量，编译期计算直接计算出表达式的值



## static 修饰

## void 类型



## 类模板的模板实参推导





## override 和 final 说明符

- 重载（overload）：不同函数函数名相同，但函数签名【形参列表及其修饰】不同
- 重写（override）：派生类函数与基类虚函数函数名相同，函数签名相同
- 隐藏（overwrite）：派生类函数与基类函数函数名相同，且基类为非虚函数或者为虚函数但函数签名不同

`override` 说明符用于显式标记派生类中重写基类虚函数的成员函数；若签名不匹配或基类无对应虚函数，编译器将报错。  

```cpp
// C++11
class Base {
public:
    virtual void f(int);
};
class Derived : public Base {
public:
    void f(int) override; // OK
    // void f(double) override; // 错误：未重写任何基类虚函数
};
```

`final` 可用于虚函数声明，禁止进一步重写该函数；也可用于类定义，禁止该类被继承。  

```cpp
// C++11
class A final { }; // A 不能被继承
// class B : public A { }; // 错误

class C {
public:
    virtual void foo() final;
};
class D : public C {
public:
    // void foo() override; // 错误：foo 被标记为 final
};
```

`override` 和 `final` 是**说明符（specifier）**而非关键字，在其他上下文中仍可作标识符使用（但不推荐）。  

```cpp
// C++11
int main() {
    int override = 0; // 合法（但应避免）
    int final = 1;    // 合法（但应避免）
}
```

使用 `override` 能防止因疏忽（如参数类型错误、const 修饰符遗漏）导致意外隐藏而非重写虚函数。  

```cpp
// C++11
class Base {
public:
    virtual void g() const;
};
class BadDerived : public Base {
public:
    void g() /* missing const */; // 隐藏 Base::g，非重写
};
class GoodDerived : public Base {
public:
    void g() const override; // 正确重写；若漏写 const 则编译失败
};
```

`final` 用于类时必须出现在类名后、基类列表前（若有），且不能与 `virtual` 继承共用（语法上允许，但逻辑冲突）。  

```cpp
// C++11
class X { };
class Y final : public X { }; // 正确位置
// class Z : public virtual Y { }; // 允许语法，但 Y 不能被继承，故无意义
```



## static_assert 声明

传统通过`assert` 宏，在运行调试期间验证程序假设，检查不可能发生的情况。如果条件为假，程序会终止并输出错误信息。

```cpp
void func(int input)
{
    assert(input != 0 && "Input must not be zero");
    cout << "Input is: " << input << endl;
}
```

`static_assert` 是 C++11 引入的编译期断言，用于在编译时验证常量表达式；若条件为 `false`，编译失败并显示指定错误信息（C++17 起可省略消息）。

```cpp
// C++11
template <typename T>
struct S {
    static_assert(sizeof(T) >= 4, "T too small");
};
S<int> s1;      // OK
// S<char> s2;  // 编译错误：T too small
```

`static_assert` 的条件必须是**常量表达式**（如 `constexpr`、类型特征、字面量），不能依赖运行时值；否则编译报错。

```cpp
// C++11
void f(int n) {
    // static_assert(n > 0, ""); // ❌ 错误：n 不是常量表达式
    static_assert(sizeof(int) == 4, ""); // ✅ 合法
}
```

C++17 起允许 `static_assert` 省略消息字符串；若未提供，编译器将生成默认诊断信息。

```cpp
// C++17
static_assert(std::is_integral_v<int>); // OK，无消息也可
// static_assert(std::is_integral_v<float>); // 编译失败，无自定义消息
```

`static_assert` 常用于模板中约束类型属性（如继承关系、是否可复制等），比 SFINAE 更直观，且能给出清晰错误提示。

```cpp
// C++11
template <typename T>
void process(T&& t) {
    static_assert(std::is_copy_constructible_v<T>, "T must be copy-constructible");
}
process(42);        // OK
// process(std::unique_ptr<int>{}); // ❌ 编译错误
```

`static_assert` 可出现在命名空间、类、函数作用域内，但其条件必须在该上下文中可求值为常量表达式。

```cpp
// C++11
class C {
    static constexpr int N = 3;
    static_assert(N > 0, "N must be positive"); // ✅ 类内合法
};
```



## 命名空间

命名空间用于将标识符（如变量、函数、类）组织到逻辑组中，避免全局作用域中的名称冲突。

```cpp
// C++98
namespace Graphics {
    void draw() {}
}
void test() {
    Graphics::draw(); // Access through scope resolution
}
```

可以使用 using 声明引入命名空间中的特定成员，避免重复写限定名。

```cpp
// C++98
namespace Math {
    double pi = 3.14159;
}
using Math::pi;
double r = pi; // Directly use pi
```

using 指令（using namespace）将整个命名空间的内容引入当前作用域，但应避免在头文件或全局作用域中使用，以防污染。

```cpp
// C++98
namespace IO {
    void log() {}
}
void test() {
    using namespace IO;
    log(); // OK
}
```

命名空间可分段定义，多次声明同一命名空间会合并其内容，适用于跨文件组织代码。

```cpp
// C++98
namespace Core {
    void init();
}
namespace Core {
    void run();
}
void f() {
    Core::init();
    Core::run();
}
```

匿名命名空间（unnamed namespace）提供内部链接，等效于 static 全局实体，仅在当前编译单元（.cpp 文件）内可见。

```cpp
// C++98
namespace {
    int secret = 42; // visible only in this translation unit
}
int get_secret() { return secret; }
```

命名空间别名可为长命名空间路径创建简短别名，提升可读性。

```cpp
// C++98
namespace VeryLongNamespaceName {
    namespace Sub {
        void work() {}
    }
}
namespace VLN = VeryLongNamespaceName::Sub;
void test() {
    VLN::work(); // use alias
}
```



## 内联命名空间

内联命名空间（inline namespace）将其成员“提升”到外层命名空间中，使得无需显式指定该内联命名空间即可访问其内容。

```cpp
// C++11
namespace Lib {
    inline namespace v2 {
        void foo() {}
    }
}
void test() {
    Lib::foo();      // OK: v2 is inline
    Lib::v2::foo();  // Also OK
}
```

内联命名空间必须是嵌套在另一个命名空间内的；全局作用域（即最外层）不能直接声明 inline namespace。

```cpp
// C++11
// inline namespace GlobalInline { } // compile error: top-level cannot be inline
namespace Outer {
    inline namespace Inner { } // OK
}
```

一个命名空间可以同时使用传统嵌套语法和带 inline 的嵌套语法声明，后续定义可省略 inline，但首次声明必须包含 inline 才生效。

```cpp
// C++11
namespace N {
    inline namespace v1 {};
}
namespace N::v1 { // 定义时可不写 inline
    void f() {}
}
// namespace N::inline v1 {
//     void f() {}
// }
void test() {
    N::f(); // OK
}
```

内联命名空间常用于版本控制：通过切换哪个子命名空间为 inline，可无缝改变默认符号版本，而无需修改用户代码。

```cpp
// C++11
namespace MathLib {
    namespace v1 {
        double compute() { return 1.0; }
    }
    inline namespace v2 {
        double compute() { return 2.0; }
    }
}
double result = MathLib::compute(); // call v2::compute()
```

非内联命名空间的成员不会被提升，必须通过完整限定名访问；而内联命名空间的成员在查找时如同定义在外层命名空间中。

```cpp
// C++11
namespace X {
    namespace plain {
        int val = 1;
    }
    inline namespace inlined {
        int val = 2;
    }
}
int a = X::val;        // OK, resolves to inlined::val
// int b = plain::val; // Error: plain not visible
int c = X::plain::val; // OK, fully qualified
```





## 函数返回类型后置

返回类型后置（trailing return type）使用 `auto` + `-> Type` 语法，使返回类型在参数列表之后声明，便于依赖参数的类型推导。

```cpp
// C++11
int f(int);
auto get_func_ptr() -> int(*)(int) {
    return f;
}
```

在模板中，后置返回类型可结合 `decltype` 推导表达式类型，避免前置返回类型无法访问参数的问题。

```cpp
// C++11
template<typename T, typename U>
auto add(T a, U b) -> decltype(a + b) {
    return a + b;
}
//or
template <typename T1, typename T2>
decltype(T1() + T2()) sum(const T1 &a, const T2 &b) {
    return t1 + t2;
}
//or
template <typename T1, typename T2>
decltype(*static_cast<T1 *>(nullptr) + *static_cast<T2 *>(nullptr)) sum1(const auto &a,
                                                                         const auto &b) {
    return a + b;
}
```

C++14 起，若函数体为单表达式返回，可省略后置返回类型，直接用 `auto` 推导（但不适用于递归或转发场景）。

```cpp
// C++14
auto add(int a, int b) { return a + b; } // return type deduced as int
```

后置语法也适用于 lambda 表达式，显式指定其返回类型。

```cpp
// C++11
auto lam = [](int x) -> int* { return new int(x); };
```

不能在函数声明与定义分离时，仅一方使用后置返回类型；两者必须一致。

```cpp
// C++11
auto bar(int) -> int; // declaration with trailing return
auto bar(int x) -> int { return x; } // definition must match
```





## 默认初始化

默认成员初始化为类的非静态数据成员提供默认值，若构造函数成员初始化列表未显式初始化该成员，则使用默认值。  

```cpp
// C++11
struct S {
    int x = 42;
    S() {}
    S(int v) : x(v) {}
};
static_assert(S{}.x == 42 && S{10}.x == 10);
```

默认成员初始化优先级低于构造函数初始化列表，但高于值初始化（如 `T{}`）中的零初始化。  

```cpp
// C++11
struct S {
    int a = 1, b = 2;
    S() : a(10) {} // b 使用默认值 2
};
static_assert(S{}.a == 10 && S{}.b == 2);
```

位域成员可使用默认成员初始化，但必须是常量表达式且在位宽表示范围内。  

```cpp
// C++20
struct B {
    int x : 4 = 7;   // OK，7 可放入 4 位
    // int y : 3 = 10; // 错误：10 超出 3 位有符号范围
};
static_assert(B{}.x == 7);
```

默认成员初始化不能用于联合体（union）的非静态成员（C++20 前），C++20 起允许但仅一个成员可有默认初始化。  

```cpp
// C++20
union U {
    int a = 42;
    double b;
};
U u{}; // 激活 a，值为 42
static_assert(u.a == 42);
```



## 列表初始化

列表初始化（braced-init-list）使用 `{}` 语法，这种语法适用于有参构造，但优先匹配 `std::initializer_list` 构造函数，即使存在其他更精确的重载。  

```cpp
// C++11
struct S {
    S(int, int) { }
    S(std::initializer_list<int>) { }
};
S s1(1, 2);   // 调用 S(int, int)
S s2{1, 2};   // 调用 S(initializer_list<int>)
```

列表初始化禁止隐式窄化转换（如 `double` 到 `int`、大整数到小整数类型），编译时报错。  

```cpp
// C++11
// int a{3.14};     // 错误：窄化
// char b{1000};    // 错误：1000 超出 char 范围
int c{100};         // OK
```

空列表 `{}` 执行值初始化，对内置类型清零，对类类型调用默认构造或零初始化。  

```cpp
// C++11
int a{};        // a == 0
std::string s{}; // 空字符串
static_assert(a == 0 && s.empty());
```

 

## default、delete成员函数

在用户未声明的前提下，编译器会为类自动添加特殊成员函数：

1. 总是自动生成析构函数；
2. 无任何用户声明的构造函数，自动生成默认构造函数；
3. 无用户声明的拷贝构造和拷贝赋值，自动生成拷贝构造函数和拷贝赋值运算符
4. 无用户声明的构造函数和析构函数，自动生成移动构造函数和移动赋值运算符

通过关键字`default`、`delete`可以显式控制特殊成员函数的编译层面的生成

`= default` 显式要求编译器生成特殊成员函数的默认实现，即使用户已声明其他构造函数。  

```cpp
// C++11
struct S {
    S(int) {}
    S() = default; // 仍可生成默认构造
};
S s{}; // OK
```

`= delete` 禁止编译器生成或允许调用某函数，可用于禁用拷贝、隐式转换等。  

```cpp
// C++11
struct NonCopyable {
    NonCopyable() = default;
    NonCopyable(const NonCopyable&) = delete;
};
// NonCopyable a, b = a; // 错误：拷贝构造被删除
```

若显式声明了析构函数，则移动构造/赋值不会自动生成；但可通过 `= default` 手动恢复。  

```cpp
// C++11
struct Movable {
    ~Movable() {} // 用户声明析构 → 移动操作不自动生成
    Movable(Movable&&) = default;
    Movable& operator=(Movable&&) = default;
};
```

`= delete` 可用于禁用特定模板实例化或隐式转换构造，比私有化更安全（链接期错误 → 编译期错误）。  

```cpp
// C++11
struct NoInt {
    NoInt(double) {}
    NoInt(int) = delete; // 禁止 int 隐式转换
};
// NoInt n{42};   // 错误
NoInt m{42.0};     // OK
```

如果某个特殊成员函数（如默认构造函数）用 `= default` 显式默认，但编译器发现成员不允许默认构造，那么该函数会被隐式标记为 `= deleted`（删除的），而非编译错误。

```cpp
// C++11
struct Bad {
    std::unique_ptr<int> p;
    Bad() = default; // OK：unique_ptr 可默认构造（为空）
};

struct Bad2 {
    const int x;
    Bad2() = default; // 错误：const 成员未初始化 → 构造函数被隐式 delete
};
```



## 联合类型

传统联合体（union）仅允许包含平凡类型，因编译器无法自动调用非平凡类型的构造/析构函数。

允许在同一内存位置存储不同类型的数据，但一次只能使用其中一个成员。  

```cpp
// C++03
union U {
    int a;
    float b;
    // std::string s; // 错误：C++03 不允许非平凡类型
};
```

C++11 起支持非受限联合体（unrestricted union），可包含非平凡类型，但用户必须手动管理生命周期（构造与析构）。  

```cpp
// C++11
#include <string>
union U {
    int i;
    std::string s;
    U() : i(0) {}
    ~U() {} // 必须自定义析构，不能自动调用 s.~string()
};
U u;
new (&u.s) std::string("hi"); // placement new
u.s.~string();                // 显式析构
```

联合体不跟踪活跃成员（active member），读取非活跃成员是未定义行为（UB），即使类型兼容。  

```cpp
// C++11
union U { int a; float b; };
U u;
u.a = 1078523331; // 特定值使 reinterpret 为 "ABC"
// printf("%c\n", u.b); // UB！即使常见实现可能“工作”
```

联合体不能包含引用成员或具有虚函数的类（因对象布局要求）。  

```cpp
// C++11
// union Bad { int& r; };        // 错误：引用成员
// union Bad2 { virtual ~Bad2(); }; // 错误：含虚函数
```

匿名联合体可在作用域内直接访问成员，常用于需要复用存储的局部场景。  

```cpp
// C++11
void f() {
    union { int i; float f; }; // 匿名联合
    i = 42;
    f = 3.14f; // 覆盖 i
}
```



## 委托构造函数

委托构造函数通过成员初始化列表调用同一类的其他构造函数，被委托者（target）先执行，委托者（delegating）函数体后执行。  

```cpp
// C++11
struct S {
    int x, y;
    S() : S(42) { y = 1; }      // 委托
    S(int a) : x(a), y(0) {}    // 被委托
};
static_assert(S{}.x == 42 && S{}.y == 1);
```

委托构造函数不能同时在初始化列表中直接初始化成员，所有成员初始化必须由被委托构造函数完成。  

```cpp
// C++11
struct Bad {
    int a;
    // Bad() : Bad(1), a(2) {} // 错误：不能混合委托与成员初始化
    Bad(int x) : a(x) {}
};
```

委托构造函数可调用模板构造函数，实现类型泛化的初始化复用。  

```cpp
// C++11
#include <vector>
#include <list>
struct Container {
    std::list<int> data;
    template<typename Iter>
    Container(Iter b, Iter e) : data(b, e) {}
    Container(const std::vector<int>& v) : Container(v.begin(), v.end()) {}
};
std::vector<int> v{1,2,3};
Container c(v); // OK
```

委托构造函数的函数体在被委托构造函数完成后执行，可用于设置标志、日志等附加逻辑。  

```cpp
// C++11
#include <iostream>
struct Logger {
    int val;
    Logger(int v) : val(v) { std::cout << "Base init\n"; }
    Logger() : Logger(0) { std::cout << "Default wrapper\n"; }
};
// 构造 Logger{} 输出两行
```



## 基类构造函数

若派生类构造函数未显式调用基类构造函数，且基类存在可访问的默认构造函数（无参或全默认参数），编译器自动插入对其的调用。  

```cpp
// C++11
struct Base { Base() = default; };
struct Derived : Base { Derived() {} }; // 隐式调用 Base()
```

若基类无任何可访问的默认构造函数，而派生类未在初始化列表中显式调用基类构造函数，则程序非良构，编译报错。  

```cpp
// C++11
struct Base { Base(int) {} };
struct Derived : Base {
    // Derived() {} // 错误：Base 无默认构造
    Derived() : Base(0) {} // OK
};
```

构造顺序严格遵循：虚基类（按最派生类中深度优先最左路径）→ 直接基类（按派生列表声明顺序）→ 非静态成员（按类内声明顺序）→ 构造函数体。初始化列表中的顺序不影响此规则。  

```cpp
// C++11
struct A { A() { puts("A"); } };
struct B { B() { puts("B"); } };
struct C : A, B { C() : B(), A() {} }; // 输出仍为 A → B
```

即使派生类构造函数体中修改基类成员，基类子对象也已在进入函数体前完成完整构造；构造不可跳过或延迟。  

```cpp
// C++11
struct Base { int x = 1; };
struct Derived : Base { Derived() { x = 2; } };
static_assert(Derived{}.x == 2);
```

在虚继承中，虚基类由最派生类负责构造，中间派生类对虚基类的初始化被忽略，仅用于维持接口完整性。  

```cpp
// C++11
struct V { V(int i) { printf("V(%d)\n", i); } };
struct A : virtual V { A() : V(1) {} };
struct B : virtual V { B() : V(2) {} };
struct C : A, B { C() : V(3), A(), B() {} }; // 仅 V(3) 被调用
```



## 继承构造函数

派生类继承基类时，不会继承基类的私有成员、构造函数、析构函数、友元和赋值运算符。

通过使用 using 声明，继承构造函数从基类从基类引入**非特殊**的构造函数，从而获得与基类构造函数签名一致的构造能力，避免重复编写构造函数。

```cpp
// C++11
#include <iostream>
struct Base {
    Base(int) { std::cout << "Base(int)\n"; }
};
struct Derived : Base {
    using Base::Base; // 继承 Base(int)
};
int main() {
    Derived d(42); // 调用继承的构造函数
}
```

继承构造函数不会继承基类的特殊构造函数（默认构造函数、拷贝构造函数、移动构造函数），这些构造函数仍然遵循隐式生成规则：若派生类未声明它们，编译器会自动合成相应的版本，并在函数体内调用对应的基类构造函数。

```cpp
// C++11
#include <iostream>
struct Base {
    Base() { std::cout << "Base()\n"; }
    Base(const Base&) { std::cout << "Base(const Base&)\n"; }
};
struct Derived : Base {
    using Base::Base;
};
int main() {
    Derived d1;           // 调用合成的默认构造（隐式调用 Base()）
    Derived d2(d1);       // 调用合成的拷贝构造（隐式调用 Base(const Base&)）
}
```

若派生类声明了与继承构造函数参数列表相同的构造函数，则该继承构造被隐藏（重载解析优先选择用户定义版本）。  

```cpp
// C++11
#include <iostream>
struct Base {
    Base(int) { std::cout << "Base(int)\n"; }
};
struct Derived : Base {
    using Base::Base;
    Derived(int) { std::cout << "Derived(int)\n"; } // 隐藏 Base(int)
};
int main() {
    Derived d(42); // 输出 "Derived(int)"
}
```

继承构造函数不能指定成员初始化列表；基类部分由对应基类构造函数初始化，派生类新增成员使用默认成员初始化值进行初始化。  

```cpp
// C++17
#include <iostream>
struct Base {
    Base(int x) { std::cout << "x=" << x << "\n"; }
};
struct Derived : Base {
    using Base::Base;
    // using Base::Base : val(0);  // 不能指定成员初始化列表
    double val = 3.14; // 默认成员初始化有效
};
int main() {
    Derived d(10); // val 初始化为 3.14
    std::cout << d.val << "\n";
}
```

继承构造函数是模板时，using 声明可继承所有实例化版本（但受访问控制和重载规则约束）。  

```cpp
// C++11
#include <iostream>
struct Base {
    template<typename T>
    Base(T) { std::cout << "Base(T)\n"; }
};
struct Derived : Base {
    using Base::Base;
};
int main() {
    Derived d(42);     // 实例化 Base<int>
    Derived d2("hi");  // 实例化 Base<const char*>
}
```



## 强枚举类型

传统枚举类型允许与整型进行隐式转换和比较，且其底层类型可能因平台而异，这种特性既破坏了类型安全性，也损害了跨平台一致性，与C++强调的强类型设计理念相违背。

```cpp
// C++11
#include <iostream>

enum Status { SUCCESS, FAILURE, PENDING };

int main() {
    Status currentStatus = SUCCESS;
    std::cout << std::boolalpha << int(currentStatus) << std::endl; // 0
    currentStatus = FAILURE;
    std::cout << std::boolalpha << int(currentStatus) << std::endl; // 1
    currentStatus = PENDING;
    std::cout << std::boolalpha << int(currentStatus) << std::endl; // 2
    return 0;
}
```

强枚举类型（scoped enumeration）使用 `enum class` 声明，其枚举值不会泄露到外层作用域，必须通过作用域解析运算符访问。  

```cpp
// C++11
#include <iostream>
enum class Status { OK, ERROR };
int main() {
    // OK; ERROR;          // 错误：未声明
    Status s = Status::ERROR;
    std::cout << static_cast<int>(s) << std::endl; // 1
}
```

强枚举类型不支持隐式转换为整型或其他算术类型，必须显式转换才能参与数值运算或输出。  

```cpp
// C++11
#include <iostream>
enum class Mode { A = 5 };
int main() {
    // int x = Mode::A;       // 错误：不能隐式转换
    int x = static_cast<int>(Mode::A); // 正确
    std::cout << x << std::endl;
}
```

强枚举类型可显式指定底层类型（如 `unsigned char`、`int` 等），默认为 `int`；底层类型决定其大小和表示范围。  

```cpp
// C++11
#include <type_traits>
enum class ByteEnum : unsigned char { X = 255 };
static_assert(sizeof(ByteEnum) == 1);
static_assert(std::is_same_v<std::underlying_type_t<ByteEnum>, unsigned char>);
```

强枚举类型的值之间支持相等性比较（`==`、`!=`），但不支持默认的顺序比较（`<`、`>` 等），除非用户自定义运算符。  

```cpp
// C++11
#include <iostream>
enum class Rank { LOW, HIGH };
int main() {
    std::cout << (Rank::LOW == Rank::HIGH) << std::endl; // 允许
    // std::cout << (Rank::LOW < Rank::HIGH) << std::endl; // 错误：无 operator<
}
```

可通过重载运算符为强枚举类型添加顺序比较能力，通常结合底层类型转换实现。  

```cpp
// C++11
#include <iostream>
enum class Priority { LOW = 0, HIGH = 1 };
constexpr bool operator<(Priority a, Priority b) {
    return static_cast<int>(a) < static_cast<int>(b);
}
int main() {
    std::cout << (Priority::LOW < Priority::HIGH) << std::endl; // 输出 1
}
```



## 异常处理

异常处理通过 `try`/`catch` 机制实现栈展开（stack unwinding），当 `throw` 抛出异常时，程序会逐层回退调用栈，销毁局部对象直至找到匹配的 `catch` 块。

```cpp
// C++98
#include <iostream>
struct Guard { ~Guard() { std::cout << "Destroyed\n"; } };
void f() {
    Guard g;
    throw 42; // 栈展开：g 的析构函数被调用
}
int main() {
    try { f(); }
    catch (int e) { std::cout << "Caught: " << e << '\n'; }
}
```

`catch` 参数可按值、引用或 const 引用捕获；推荐使用 `const&` 避免对象切片并支持多态异常类型。

```cpp
// C++98
#include <stdexcept>
#include <iostream>
void f() { throw std::runtime_error("Oops"); }
int main() {
    try { f(); }
    catch (const std::exception& e) { // 正确：捕获派生类异常
        std::cout << e.what() << '\n';
    }
}
```

`throw;`（无操作数）只能在 `catch` 块内使用，用于重新抛出当前异常，保留原始异常类型和信息。

```cpp
// C++98
#include <iostream>
void inner() { throw "Error"; }
void outer() {
    try { inner(); }
    catch (...) {
        std::cout << "Rethrowing\n";
        throw; // 重新抛出原异常
    }
}
int main() {
    try { outer(); }
    catch (const char* s) { std::cout << s << '\n'; }
}
```

异常规范（如 `throw(T)`）在 C++11 起被弃用，C++17 起移除；取而代之的是 `noexcept` 说明符，用于指定函数是否可能抛出异常。

```cpp
// C++11
void may_throw() {}          // 可能抛出
void never_throws() noexcept {} // 承诺不抛出
static_assert(noexcept(never_throws()), "");
```

若异常传播至 `main` 且未被捕获，程序调用 `std::terminate()`；可通过 `std::set_terminate()` 自定义终止行为。

```cpp
// C++98
#include <cstdlib>
#include <iostream>
void handler() { std::cout << "Terminate!\n"; std::exit(1); }
int main() {
    std::set_terminate(handler);
    throw 0; // 未捕获 → 调用 handler
}
```



## 结构化绑定

结构化绑定（structured bindings）是 C++17 引入的语法特性，允许从数组、结构体或类元组类型中一次性声明并初始化多个变量。

```cpp
// C++17
#include <iostream>
int arr[3] = {1, 2, 3};
auto [x, y, z] = arr;
// x, y, z 是 arr 元素的副本（因为 arr 是普通数组）
std::cout << x << ' ' << y << ' ' << z << '\n';
```

结构化绑定不总是创建副本；其行为取决于初始化表达式的值类别和绑定语法。若使用 `auto&`，则绑定为引用而非副本。

```cpp
// C++17
#include <iostream>
int arr[3] = {1, 2, 3};
auto& [x, y, z] = arr; // x, y, z 是 arr[0], arr[1], arr[2] 的引用
++x;
std::cout << arr[0] << '\n'; // 输出 2
```

结构化绑定可用于聚合类型（如普通 struct），无需实现任何特殊接口。

```cpp
// C++17
struct Point { int x; int y; };
Point p{10, 20};
auto [a, b] = p; // a = 10, b = 20
std::cout << a << ", " << b << '\n';
```

对于 std::tuple、std::pair 等“类元组”类型，结构化绑定通过 `std::get<I>(e)` 和 `std::tuple_size<T>::value` 等机制工作，要求这些特化在作用域内可见。

```cpp
// C++17
#include <tuple>
#include <iostream>
std::tuple<int, double> t{42, 3.14};
auto [i, d] = t;
std::cout << i << ", " << d << '\n';
```

在范围 for 循环中，结构化绑定可直接解构容器元素（如 map 的 std::pair<const Key, T>），避免 .first/.second 的冗长写法。

```cpp
// C++17
#include <map>
#include <iostream>
std::map<std::string, int> m{{"A", 1}, {"B", 2}};
for (const auto& [k, v] : m) {
    std::cout << k << ':' << v << '\n';
}
```

结构化绑定声明中的标识符数量必须严格等于被解构对象的可绑定元素数量，否则程序非良构（编译错误）。

```cpp
// C++17
struct S { int a; int b; };
S s{1, 2};
// auto [x] = s;        // 错误：S 有两个成员，不能只绑定一个
auto [x, y] = s;        // 正确
```

 

## 三向比较

三向比较运算符 `<=>`（又称“宇宙飞船运算符”）在 C++20 中引入，返回 `std::strong_ordering`、`std::weak_ordering` 或 `std::partial_ordering` 等类型，用于统一表示小于、等于或大于关系。

```cpp
// C++20
#include <compare>
#include <iostream>
int a = 1, b = 2;
auto cmp = a <=> b;
if (cmp < 0) std::cout << "a < b\n";
```

对于基础类型（如 `int`、`double`、指针等），编译器自动支持 `<=>`，无需用户定义。

```cpp
// C++20
#include <compare>
static_assert((42 <=> 42) == 0);
static_assert((1 <=> 2) < 0);
static_assert((3.5 <=> 2.1) > 0);
```

若用户为自定义类型显式声明了 `operator<=>`，编译器**不会自动生成 `operator==`**，除非该 `<=>` 被声明为 `default` 且满足特定条件；这是为了防止不一致的相等语义。

```cpp
// C++20
#include <compare>
struct A {
    int x;
    auto operator<=>(const A&) const = default; // 此时会自动生成 operator==
};
static_assert(A{1} == A{1});

struct B {
    int x;
    auto operator<=>(const B& other) const { return x <=> other.x; } // 用户定义
    // 不会自动生成 operator==！
};
// static_assert(B{1} == B{1}); // 错误：没有 operator==
```

要使用户定义的 `operator<=>` 触发 `operator==` 自动生成，必须同时显式 `= default` `operator==`，或完全依赖默认成员比较。

```cpp
// C++20
struct C {
    int x;
    auto operator<=>(const C&) const = default;
    bool operator==(const C&) const = default; // 实际可省略，因 <=> default 会隐式生成 ==
};
```

三向比较支持不同强度的排序语义：`strong_ordering`（全序，值相等即等价）、`weak_ordering`（等价但不一定值相等）、`partial_ordering`（允许无序，如浮点 NaN）。

```cpp
// C++20
#include <compare>
float a = 0.0f, b = -0.0f;
static_assert((a <=> b) == std::partial_ordering::equivalent); // 值不同但等价
static_assert(!(a == b)); // 但 == 返回 true（IEEE 754）
// 注意：浮点 `<=>` 返回 partial_ordering，但 == 仍按 IEEE 行为
```



## 线程局部存储



## 扩展的inline说明符



## 字面量优化



## alignas和alignof



## 属性说明符和标准属性



## 新增预处理器功能和宏



## 协程



## 可变参数模板



## typename优化



## 模板参数优化



## 用户自定义推导指引



## SFINAE



## 概念与约束



## 基础特性的其他优化



## 模板特性的其他优化


---
draft: false

title: "Cpp Features"
description: "在“黑马”原地踏步，来看看 CPP 的魔鬼细节"
date: 2025-12-23
author: ["biglonglong"]

tags: ["summary", "cpp"]
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



## long long

```cpp
long long x = 2147483647LL + 2;
long long y = 2147483647 + 2;

std::cout << sizeof(long long) << std::endl;                     // 8
std::cout << std::numeric_limits<int>::max() << std::endl;       // 2147483647
std::cout << std::numeric_limits<long long>::max() << std::endl; // 9223372036854775807
std::cout << "Value of x: " << x << std::endl;                   // 2147483649
std::cout << "Value of y: " << y << std::endl;                   // -2147483647
```

编译器在处理一个没有任何限定修饰的整型字面量时，默认编译为32位 int 类型（此时编译器不会以目标变量类型作为参考），发现超出 int 范围时确定为 long 或 long long，然后赋值给目标变量，如果类型不匹配，会进行隐式转换



## char_16t 与 char32_t

```cpp
char utf8_char = 'A'; // character before C++20, but encoder unknown, typically UTF-8
// char8_t utf8_char8 = u8'A';  // UTF-8 character in C++20 and later
char16_t utf16_char = u'A';     // UTF-16 character
char16_t utf16_char_cn = u'牛'; // UTF-16 character，including Chinese character
char32_t utf32_char_cn = U'牛'; // UTF-32 character, typically used as Unicode

std::cout << utf8_char << std::endl;     // A
std::cout << utf16_char << std::endl;    // 65
std::cout << utf16_char_cn << std::endl; // 29275
std::cout << utf32_char_cn << std::endl; // 29275
```

- **Unicode（统一码）**：全球所有文字系统统一字符集，每个字符分配唯一的编号（码点）
- **UTF系列（Unicode转换格式）**：将Unicode码点转换为字节序列的方法，UTF-8使用1~4个字节表示，UTF-16使用2或4字节表示，UTF-32每个字符固定4字节
- **GBK（中文扩展编码）**：中文专用编码，与Unicode不兼容



## 命名空间

```cpp
namespace A
{
    namespace B
    {
        namespace C
        {
            void func()
            {
                std::cout << "Function in namespace A::B::C" << std::endl;
            }
        }
    }
}

// 简化写法：
namespace A::B::C
{
    void func()
    {
        std::cout << "Function in namespace A::B::C using C++11 syntax" << std::endl;
    }
}
```

### 内联命名空间

```cpp
namespace Parent
{
    namespace V1
    {
        void func()
        {
            std::cout << "Parent::V1::func()" << std::endl;
        }
    }
    inline namespace V2
    {
        void func()
        {
            std::cout << "Parent::V2::func()" << std::endl;
        }
    }
}

// 简化写法：
namespace Parent::V1
{
    void func()
    {
        std::cout << "Parent::V1::func()" << std::endl;
    }
}
namespace Parent::inline V2
{
    void func()
    {
        std::cout << "Parent::V2::func()" << std::endl;
    }
}

Parent::V1::func(); // Calls V1 version
Parent::func();     // Calls V2 version due to inline namespace
```

内联命名空间不允许用在第一层命名空间中。

非内联命名空间需要逐层递归到空间内再使用元素，内联命名空间会将其内元素导入到父命名空间中，与父命名空间使用相同的作用域。该特性常用于内测版本更新。



## auto 关键字

自动类型推导，让编译器根据**初始化表达式**推断出变量的合适类型，或者作为函数声明时返回类型的占位符。

```cpp
auto i = 5;               // int
auto str = "Hello, AUTO"; // const char*

auto sum(int a, int b) -> int // C++11 trailing return type
{
    return a + b;
}
```

```cpp
// 从左到右推导
auto x = 1, y = 3.14; // error, auto -> int

// 使用表达能力更强的类型
auto x = true ? 1 : 4.2; // double
static_assert(std::is_same<decltype(x), double>::value, "x should be of type double");

// 不能用来声明非静态成员变量
// C++20 之前不允许声明形参
```

```cpp

```



## 委托构造函数



## 初始化



## nullptr 与 NULL

空指针，



## enum

枚举类型，



## constexpr

常量表达式（编译时性能优化），



## for(:)

遍历简化语法，



## 结构化绑定



## 智能指针

### unique_ptr

唯一智能指针，

### shared_ptr

共享智能指针，



## Lambda 表达式

匿名函数，



## 右值引用









## const 修饰

向编译器和其他程序员承诺，这个值/对象不会改变，定义时必须初始化；不能将const 修饰变量非 const 化

### with 指针

- `const int *p1 = &a`/`int const *p1 = &a`：指向常量的指针，指针指向可以改，指针指向的值不可以更改
- `int *const p2 = &a`：指针常量，指针指向不可以改，指针指向的值可以更改
- `const int *const p1 = &a`：指向常量的常量指针，指针指向不可以改，指针指向的值不可以更改

### const 引用

- `const int &p1 = &a`/`int const &p1 = &a`：常量引用，引用常量值，可以初始化为临时对象或字面值

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

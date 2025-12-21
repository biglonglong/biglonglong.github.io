---
draft: false

title: "Cpp from 0 to 1"
description: "菜鸟程序员的C++速成/计算机科班重新做“人”"
date: 2025-03-28
author: ["biglonglong"]

tags: ["summary", "cpp"]
summary: ""

math: false
weight: 101
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



# C++基础入门

## C++ 初识

### Hello World

```cpp
#include<iostream>
using namespace std;

int main() {
	cout << "Hello world" << endl;
	system("pause");
	return 0;
}
```

### 注释

在代码中加一些说明和解释，方便程序员阅读。编译器在编译代码时，会**忽略**注释的内容。

- `// 描述信息` ：单行注释，放在一行代码的上方或者一条语句的末尾，对该行代码说明
-  `/* 描述信息 */`：多行注释，放在一段代码的上方，对该段代码做整体说明

### 变量

给一段指定内存空间起名，方便操作这段内存。创建变量时，最好初始化。

`数据类型 变量名 = 初始值`

### 常量

记录程序中**不可更改**的数据。创建常量时，必须**初始化**。

- `#define 常量名 常量值`：define宏常量，通常在文件最开始定义，由预处理器替换为字面值
- `const 数据类型 常量名 = 常量值`：const修饰的变量

### 预保留标识符

|            |              |                  |             |          |
| ---------- | ------------ | ---------------- | ----------- | -------- |
| asm        | do           | if               | return      | typedef  |
| auto       | double       | inline           | short       | typeid   |
| bool       | dynamic_cast | int              | signed      | typename |
| break      | else         | long             | sizeof      | union    |
| case       | enum         | mutable          | static      | unsigned |
| catch      | explicit     | namespace        | static_cast | using    |
| char       | export       | new              | struct      | virtual  |
| class      | extern       | operator         | switch      | void     |
| const      | false        | private          | template    | volatile |
| const_cast | float        | protected        | this        | wchar_t  |
| continue   | for          | public           | throw       | while    |
| default    | friend       | register         | true        |          |
| delete     | goto         | reinterpret_cast | try         |          |

### 自定义标识符

自定义标识符（对象名）命名的一些规则：

* 标识符不能是关键字
* 标识符只能由大小字母、数字、下划线组成
* 第一个字符必须为字母或下划线，以方便语法解析
* 见名知意

### 字面值

源代码中直接表示的**固定值**，编译器无需计算就能理解其值。

- 十进制整数：`42`
- 十进制无符号整数：`42U`
- 十进制浮点数：`3.14`
- 科学计数法：`1.6e-19`
- 八进制整数：`042`
- 十六进制整数：`0x2a`
- 二进制整数：`0b101010`
- 字符：`'A'`
- 转义字符：`'\n'`
- 字符串：`"Hello"`
- 布尔：`true`
- 指针：`nullptr`、`NULL`



## 数据类型

创建一个对象时，必须要指定出相应的数据类型，表明该对象的大小，范围及其属性。

### 内置类型

| 整型           | 占用         | 取值范围                                              | 示例                                                         |
| -------------- | ------------ | ----------------------------------------------------- | ------------------------------------------------------------ |
| short          | 2字节        | (-2^15 ~ 2^15-1)                                      | `short num = 1`                                              |
| int            | 4字节        | (-2^31 ~ 2^31-1)                                      | `int num = 1`                                                |
| long           | 4字节或8字节 | (-2^31 ~ 2^31-1)                                      | `long num = 1`                                               |
| long long      | 8字节        | (-2^63 ~ 2^63-1)                                      | `long long num = 1`                                          |
| **字符型**     |              |                                                       |                                                              |
| (signed) char  | 1字节        | ASCII编码可显示字符集<br >ASCII编码不可显示转义字符集 | `char ch = 'a'`                                              |
| **布尔型**     |              |                                                       |                                                              |
| bool           | 1字节        | true(1)   false(0)                                    | `bool flag = true`                                           |
| **浮点型**     |              |                                                       |                                                              |
| float          | 4字节        | 7位有效数字                                           | `float f1 = 3.14`<br>`float f1 = 3.14f`<br/>`float f2 = 3e2` |
| double(双精度) | 8字节        | 15位有效数字                                          | `double d1 = 3.14`                                           |

> `sizeof( 数据类型 / 对象)`可以统计数据类型或对象所占字节数

### 自定义类型

#### string [类](./面向对象.md)

通过面向对象特性或修饰属性（如数组、指针、引用、const或static等）自定义数据类型，以字符串为例：

- `string  字符串名 = "字符串值"`：C++风格字符串
- `char 字符串名[] = "字符串值"`：C风格字符串，需要一个字节存储结尾字符`\0`

#### 结构体

通过结构体可以打包相关数据

- `struct 结构体名 { 结构体成员列表 };`：定义结构体
- `结构体名 结构体对象名 = { 成员1值 ， 成员2值...}`：创建结构体
- `结构体对象名.成员`：访问结构体成员
- `结构体对象指针名->成员`：访问结构体指针成员

### 指针

复合类型`基本数据类型 *`，用于保存基本数据类型对象的内存地址，长度由系统位数决定。

`基本数据类型 *指针名 = &其他对象`

- 空指针`NULL、nullptr、0`：用于初始化指针，不可访问
- 野指针：指针指向非法的内存空间，不可访问
- `&a`：通过&取地址，得到对象内存地址
- `*p`：通过*解引用，得到指针指向的值

> - `const int *p1 = &a`/`int const *p1 = &a`：指向常量的指针，指针指向可以改，指针指向的值不可以更改
> - `int *const p2 = &a`：指针常量，指针指向不可以改，指针指向的值可以更改
> - `const int *const p1 = &a`：指向常量的常量指针，指针指向不可以改，指针指向的值不可以更改

### 引用

复合类型`基本数据类型 &`，给已存在对象另外分配一个对象名 ，**不是新对象**，不占用独立内存空间。必须初始化为非临时对象且不可更改！

`数据类型 &别名 = 原名`

- 不要返回局部变量/临时对象的引用，因为局部变量/临时对象可能会被销毁；
- 函数返回引用可以作为左值，从而修改引用函数内部处理的对象

> `const int &p1 = &a`/`int const &p1 = &a`：常量引用，引用常量值，可以初始化为临时对象或字面值



### 类型转换

不同内置数据类型之间可以进行强制类型转换

`转换后数据类型 转换后对象 = (转换后数据类型)转换前对象`

不同内置数据类型之间发生运算，会进行自动类型转换，如`int`和``unsgined`之间运算时，`int -> unsigned`会自动发生；同时，运算结果会自动进行类型推理。



### 数组

连续存放相同类型数据元素的集合

一维数组定义：

`数据类型  数组名[数组长度] = { 值1，值2 ...}`

`数据类型  数组名[] = { 值1，值2 ...}`

` 数据类型  数组名[数组长度] `

二维数组定义：

`数据类型  数组名[ 行数 ][ 列数 ] = { {数据1，数据2 }, {数据3，数据4 } }`

`数据类型  数组名[ 行数 ][ 列数 ] = { 数据1，数据2，数据3，数据4}`

` 数据类型  数组名[  ][ 列数 ] = { 数据1，数据2，数据3，数据4}` 

` 数据类型  数组名[ 行数 ][ 列数 ] `

- `数组名[下标]...[下标]`：数组访问
- 数组可以理解为 `数据类型 []`数组类型
  - `sizeof(arr)`：统计整个数组在内存中的长度；
  - `&arr`：数组首地址，与`&arr[0]` 地址值相同，但类型不同，意义不同
- 大多表达式中会退化为`数据类型 * const`指针常量类型
  - `arr + 1`：下一个元素地址
  - `*arr`：首元素值

- 函数参数中的数组名，实际是普通指针，除非使用引用`int (&arr)[]`

- 多维数组的定义是一种嵌套，即二维数组是一维数组的数组

## 运算符

| 算数运算符     | 术语     | 示例       | 结果     |
| -------------- | -------- | ---------- | -------- |
| +              | 正号     | +3         | 3        |
| -              | 负号     | -3         | -3       |
| +              | 加       | 10 + 5     | 15       |
| -              | 减       | 10 - 5     | 5        |
| *              | 乘       | 10 * 5     | 50       |
| /              | 除       | 10 / 5     | 2        |
| %              | 整数取模 | 10 % 3     | 1        |
| ++             | 前置递增 | a=2; b=++a | a=3; b=3 |
| ++             | 后置递增 | a=2; b=a++ | a=3; b=2 |
| --             | 前置递减 | a=2; b=--a | a=1; b=1 |
| --             | 后置递减 | a=2; b=a-- | a=1; b=2 |
| **赋值运算符** |          |            |          |
| =              | 赋值     | a=2; b=3   | a=2; b=3 |
| +=             | 加等于   | a=0; a+=2  | a=2      |
| -=             | 减等于   | a=5; a-=3  | a=2      |
| *=             | 乘等于   | a=2; a*=2  | a=4      |
| /=             | 除等于   | a=4; a/=2  | a=2      |
| %=             | 模等于   | a=3; a%=2  | a=1      |
| **比较运算符** |          |            |          |
| ==             | 相等于   | 4 == 3     | 0        |
| !=             | 不等于   | 4 != 3     | 1        |
| <              | 小于     | 4 < 3      | 0        |
| \>             | 大于     | 4 > 3      | 1        |
| <=             | 小于等于 | 4 <= 3     | 0        |
| \>=            | 大于等于 | 4 >= 1     | 1        |
| **逻辑运算符** |          |            |          |
| !              | 非       | !a         | 真假反转 |
| &&             | 与       | a && b     | 有假为假 |
| \|\|           | 或       | a \|\| b   | 有真为真 |
| IO**运算符**   |          |            |          |
| <<             | 输出     | cout << a  | cout     |
| >>             | 输入     | cin >> a   | cin      |

> 不同运算符之间存在优先级，如输出运算符`<<`优先级大于比较运算符和逻辑运算符



## 程序流程结构

下面的结构间可以互相嵌套

### if语句

```cpp
if (condition) {
    /* code */
} 
else if (condition) {
    /* code */
}
// ...
else {
    /* code */
}
```

### 三目运算符

```cpp
表达式1 ? 表达式2:表达式3
```

### switch语句

```cpp
switch (expression) {
    case constant expression:
        /* code */
        break;
	// ...
    default:
        break;
}
// expression为整型或者字符型
// case没有break，则会一直向下执行
```

### while语句

```cpp
while (condition) {
    /* code */
}
```

### do…while语句

```cpp
do
{
    /* code */
} while (condition);
```

### for语句

```cpp
for (size_t i = 0; i < count; i++) {
    /* code */
}
```

### 跳转语句

- `break`：跳出最近的内层循环语句
- `continue`：直接开始执行最内侧循环的下一轮
- `goto 标记`：无条件跳转到`标记:`处开始执行



## 函数

### 定义

面向过程编程，将一段经常使用的代码封装起来，减少重复代码

```cpp
返回值类型 函数名(参数类型 形参列表) {
    函数体语句;
    return 表达式;
}
```

### 调用

使用定义的封装代码

`返回值类型 返回对象 = 函数名(实参)`

### 声明

告诉编译器函数名称及如何调用函数，函数的实体另外定义。函数的声明可以多次，但是函数的定义只能有一次

`返回值类型 函数名(参数类型 形参的列表)`

### 参数传递

- 值传递：形参和实参是不同地址空间的对象。如果形参发生变化，并不会影响实参。
- 地址传递：以地址作为参数，形参和实参操作的是同一地址空间。形参可以修改实参的值。
- 引用传递：形参是实参的别名，形参和实参操作的是同一对象。形参可以修改实参的值。

### 参数类型

- `(数据类型 参数= 默认值)`：默认参数，放在参数列表最后，调用时可省略默认，可被修改
  - 默认参数的默认值只能在函数定义或声明中指定一次，不能重复指定
- `(数据类型)`：占位参数，调用函数时必须填补该位置，可以有默认值

### 重载

相同的函数名作用于不同的参数类型，提高复用性，可重载条件如下：

* 同一个作用域下
* 函数名称相同
* **函数参数不同**，如个数、类型、顺序、引用与常量引用
  * 函数参数中存在默认参数时容易存在歧义重载



## 内存分区模型

- 代码区：存放函数体的二进制机器指令，只读共享，由操作系统进行管理的
- 全局区：存放全局变量和静态变量以及常量区存放常量和const修饰全局变量，由操作系统进行管理的
- 栈区：程序运行后，由编译器自动分配释放, 存放函数的参数值、局部变量等，==这也是为什么不要返回局部变量的地址或者引用==
- 堆区：程序运行后，由程序员通过`new`分配和`delete`释放,若程序员不释放，程序结束时由操作系统回收
  - `数据类型 *变量名 = new 数据类型(初始值)`：开辟数据，返回该数据对应的类型的指针
  - `数据类型 *数组名 = new 数据类型[初始大小]`：开辟数组
  - `delete 变量名`：释放数据
  - `delete[] 数组名`：释放数组



## 分文件编写

1. 创建后缀名为.h的头文件 ，引入必要库，说明源文件的声明

2. 创建后缀名为.cpp的同名源文件，引入头文件，定义头文件声明

3. 创建后缀名为.cpp的调用源文件，引入头文件，调用头文件声明

   > 模板不是真正的代码，而是代码的"模具"。编译器在实例化（调用）模板时，才根据具体类型生成真正的代码。
   >
   > 分文件编写的类模板由于文件隔离，无法编译类实现
   >
   > 因此，要求声明和实现在同一文件中，即`.hpp`



## 文件操作

`#include <fstream>`：ofstream写、ifstream读、fstream读写

| 文件打开方式，可配合` | `使用                       | 解释 |
| --------------------- | --------------------------- |
| ios::in               | 为读文件而打开文件          |
| ios::out              | 为写文件而打开文件          |
| ios::ate              | 初始位置：文件尾            |
| ios::app              | 追加方式写文件              |
| ios::trunc            | 如果文件存在先删除，再创建  |
| ios::binary           | 二进制方式，默认以ASCII打开 |

```cpp
// ASCII 文件
#include <fstream>
using namespace std;

int main() {
	ofstream ofs;
	ofs.open("test.txt", ios::out);
	ofs << "姓名：张三" << endl;
	ofs << "性别：男" << endl;
	ofs << "年龄：18" << endl;
	ofs.close();

    ifstream ifs;
	ifs.open("test.txt", ios::in);
    if (!ifs.is_open()) {
		cout << "文件打开失败" << endl;
		return;
	}
    char buf[1024] = { 0 };
	while (ifs >> buf) {
		cout << buf << endl;
	}
    ifs.close();
    
	return 0;
}
```

```cpp
// binary 文件
#include <fstream>
using namespace std;

int main() {
	ofstream ofs;
	ofs.open("person.txt", ios::out | ios::binary);
	int p = 1;
	ofs.write((const char *)&p, sizeof(p));
	ofs.close();
	
	ifstream ifs;
    ifs.open("person.txt", ios::in | ios::binary);
	if (!ifs.is_open()) {
		cout << "文件打开失败" << endl;
	}
    int p;
	ifs.read((char *)&p, sizeof(p));
	ifs.close();

	return 0;
}
```





# C++类和对象

## 封装

将属性和行为作为一个整体，加以权限控制

定义类：`class 类名{访问权限: 属性/行为};`

访问权限：

- public：公共权限，类内可以访问，类外可以访问
- protected：保护权限，类内可以访问，类外不可以访问
- private：私有权限，默认访问权限【struct 默认访问权限为公共权限】，类内可以访问，类外不可以访问

访问对象：`对象名.成员;`|`对象名->成员;`

```cpp
#pragma once
#include <iostream>
#include <cmath>
using namespace std;

class Point
{
    // friend ...
public:
	Point();		// 默认构造，即无参构造
	Point(double x, double y);		// 有参构造
    Point(const Point& point);		// 拷贝构造
	~Point() = default;		
	double getX();
	double getY();
	void setX(double x);
	void setY(double y);
    
    static void setFlag(int target);
    void constfix() const;
    void nullCheck();
public:
    mutable int index;
    static int flag;
private:
	double x;
	double y;
};

class Circle
{
public:
	Circle() = default;
    // 默认构造，对应成员属性的默认初始化
	Circle(double radius, Point center);
	~Circle() = default;
	double getRadius();
	Point getCenter();
	void setRadius(double radius);
	void setCenter(Point center);
private:
	double radius;
	Point center;
};
```

```cpp
#include "circle.h"

Point::Point(): x(0), y(0) {}
Point::Point(double a, double b): x(a), y(b) {}
Point::Point(const Point& point) {
    this->x = point.x;
    this->y = point.y;
}
double Point::getX() {
    return x;
}
double Point::getY() {
    return y;
}
void Point::setX(double x) {
    this->x = x;
}
void Point::setY(double y) {
    this->y = y;
}
void Point::setFlag(int target) {
    flag = target;
}
int Point::flag = 0;
void Point::constfix() const {
    this->index = 1;
    cout<< this->index << endl;
}

void Point::nullCheck() {
    if(this == NULL) return;
    cout<< this->x << ',' << this->y << endl;
}

Circle::Circle(double radius, Point center) {
    this->radius = radius;
    this->center = center;
}
double Circle::getRadius() {
    return radius;
}
Point Circle::getCenter() {
    return center;
}
void Circle::setRadius(double radius) {
    this->radius = radius;
}
void Circle::setCenter(Point center) {
    this->center = center;
}
```

```cpp
Point p1;  						// 无参构造
Point p2(0, 0);  				// 括号有参构造
Point p3 = Point(p2); 			// 显示有参构造，匿名对象
Point p4 = p3;					// 隐式有参构造
// 不能拷贝构造匿名对象
// Point(p4);

p1.flag = 1;  				// Point::flag
p1.setFlag(1);				// Point::setFlag(1);



Point *p = NULL;
p->nullCheck();

const Point pa;
pa.constfix();
```

### 封装模型

```txt
┌─────────────────────────────┐
│       代码区 (Text)          │
│  - 所有可执行代码		     │
│  - 成员函数代码（共享）		   │
│  - 虚函数表（vtable）	      │
├─────────────────────────────┤
│       数据区 (Data)          │
│  - 全局变量        		   │
│  - 静态成员变量（共享）		   │
│  - 字符串常量		   		  │
├─────────────────────────────┤
│       BSS区 (未初始化数据)    │ 
│  - 未初始化数据	    	      │
├─────────────────────────────┤
│       堆 (Heap)             │ ← new创建的对象
│  ┌─────────────────────┐    │
│  │ 对象1: 			    │    │
│  │  - 虚函数表指针(vptr) │    │
│  │  - int, char...     │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 对象2: ... 		    │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│           栈 (Stack)        │ ← 局部对象
│  ┌─────────────────────┐    │
│  │ 对象3: 			    │    │
│  │  - 虚函数表指针(vptr) │    │
│  │  - int, char...     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

- 空对象占用一个字节，以确保每个对象在内存中都有唯一的地址。
- 对象空指针也是可以调用成员函数的，但要保证不存在访问`this`指针的可能性。

### 构造函数

对象自动初始化，可以重载，编译器提供空实现的无参构造和浅拷贝的拷贝构造及赋值重载

`类名(形参列表){}`

- 如果定义了有参构造函数，编译器不再提供无参构造；如果定义了拷贝构造函数，不再提供其他构造函数
- 当成员属性中存在指针类型，且没有自定义深拷贝构造和赋值【在堆区重新申请空间拷贝成员指针变量指向的值】，存在重复地址释放的风险

### 析构函数

对象自动销毁清理，不可重载，编译器提供空实现的无参析构

`~类名(){`

- 对象按执行顺序构造，析构反之

- 先构造对象成员，再构造本对象，析构反之

- 构造子类时，先构造父类，再构造子类，析构反之

- 当属性中存在堆区数据时，最好在析构函数中手动销毁

  ```cpp
  if(p!=nullptr) {
  	delete p;
  	p = nullptr;
  }
  ```


### 修饰

#### this指针

类预定义指针常量，隐含在每个非静态成员中，指向被调用成员所属的对象

- 当形参和成员变量同名时，可用 this 指针来区分
- 在类的非静态成员函数中返回对象本身，即 `return *this` 

#### static修饰成员

在成员变量和成员函数前加上关键字static，静态成员供类下所有对象共享

- 静态成员变量要求类内声明，类外初始化
- 静态成员函数只能访问静态成员变量

#### const修饰成员

在成员函数参数列表后加上关键字const，const成员不允许对成员变量进行修改

- 常函数不可以修改成员变量，但成员变量声明时加关键字mutable后，在常函数中依然可以修改；
- 常对象只能调用常函数或修改mutable变量

### 友元

有些私有属性让类外一些特殊的函数或者类进行访问

#### 全局函数

```
friend void visit(Building * building);
```

#### 类

```
friend class goodGay;
```

#### 成员函数

```
friend void goodGay::visit(Building * building);
```

## 运算符重载

重定义运算符像定义函数一样，可以是全局函数，也可以是成员函数。

```cpp
class Person
{
public:
	Person() = default;
	Person(string name) {
		this->name = name;
        this->total = 1;
	};
	~Person() = default;

public:
	string name;
    int total;

public:
    // 成员函数实现 + 重载
    // p_object + p_param 或者 p_object.operator+(p_param)
    Person operator+(const Person& p) {
        Person temp("sum");
        temp.total = this->total + p.total;
        return temp;
    }

    // 成员函数实现 << 重载
    // p_object << cout 或者 p_object.operator<<(cout) 左附加
     ostream& operator<<(ostream& os) {
        os << this->name << " " << this->total << endl;
        return os;
    }

    // 成员函数实现 前置++ 重载
    // ++p_object 或者 p_object.operator++()
    Person& operator++() {
        this->total++;
        return *this;
    }

    // 成员函数实现 后置++ 重载
    // p_object++ 或者 p_object.operator++(0)
    Person operator++(int) {
        Person temp = *this;
        this->total++;
        return temp;
    }

    // 成员函数实现 = 重载
    // p_object = p_param 或者 p_object.operator=(p_param) 右优先
    Person& operator=(const Person& p) {
        this->name = p.name;
        this->total = p.total;
        return *this;
    }

    // 成员函数实现 == 重载
    // p_object == p_param 或者 p_object.operator==(p_param)
    bool operator==(const Person& p) {
        return this->total == p.total;
    }

    // 成员函数实现 () 重载
    // p_object(string_param) 或者 p_object.operator()(string_param) 仿函数
    // 与匿名对象Person(string_param)有点像
    void operator()(string name) {
        this->name = name;
        return;
    }
}; 
```

```cpp
//全局函数实现 + 重载
//p1 + p2 或者 operator+(p1, p2)
Person operator+(const Person& p1, const Person& p2) {
    Person temp("sum");
    temp.total = p1.total + p2.total;
    return temp;
}

//全局函数实现 << 重载
//cout << p 或者 operator<<(cout, p) 右附加
ostream& operator<<(ostream& os, const Person& p) {
    os << p.name << " " << p.total << endl;
    return os;
}
```



## 继承

呈树型的类关系，派生类（子类）除了拥有基类（父类）的成员，还有自己独有的成员。

继承类：`class 子类：继承方式 父类{};`，可多继承，即 `class 子类 ：继承方式1 父类1, 继承方式2 父类2...{};`。

继承方式：

- public公共继承：保持成员访问权限，无法访问父类的私有成员
- protected保护继承：成员访问权限保护化，无法访问父类的私有成员
- private私有继承：成员访问权限私有化，无法访问父类的私有成员

```cpp
class Animal
{
public:
    Animal() = default;
    Animal(string name) : name(name) {}
    virtual ~Animal() = default;

    virtual void makeSound() const
    {
        cout << name << " makes a sound." << endl;
    };

    string getName() const
    {
        return name;
    }
    string name;
};

class Dog : virtual public Animal
{
public:
    Dog(string name) : Animal(name) {}
    ~Dog() = default;

    void makeSound() const override
    {
        cout << name << " says: Woof!" << endl;
    }

    int DogId;
};

class Cat : virtual public Animal
{
public:
    Cat(string name) : Animal(name) {}
    ~Cat() = default;

    void makeSound() const override
    {
        cout << name << " says: Meow!" << endl;
    }

    int CatId;
};

class DogCat : public Dog, public Cat
{
public:
    DogCat(string name) : Animal(name), Dog(name), Cat(name) {}
    ~DogCat() = default;

    void makeSound() const override
    {
        Dog::makeSound();
        Cat::makeSound();
    }
};
```

### 继承模型

```txt
CatDog 菱形继承对象：
┌─────────────────┐
│ Cat 部分         │
│   ├ Animal数据   │ ← name (副本1)
│   └ CatId   	  │
├─────────────────┤
│ Dog 部分         │
│   ├ Animal数据   │ ← name (副本2)
│   └ DogId   	  │
├─────────────────┤
│ CatDog 部分	     │
└─────────────────┘
CatDog 虚继承对象（父类数据不在虚继承子类中）：
┌─────────────────┐
│ Cat 部分         │
| 虚基类指针(Cat)   | ← 指向 Animal部分
│   └ CatId   	  │
├─────────────────┤
│ Dog 部分         │
| 虚基类指针(Dog)   | ← 指向 Animal部分
│   └ DogId   	  │
├─────────────────┤
│ CatDog部分       │
├─────────────────┤
│ Animal部分       │ ← 只有一个共享副本！
│  └ name          │
└─────────────────┘
```

- 子类对象访问同名成员，子类同名成员直接访问，父类同名成员使用作用域区分访问
- 产生菱形继承时，孙类会继承了爷类两份重复成员，无法直接访问重复成员，但可以使用作用域区分访问。**虚继承**解决菱形继承重复数据的问题



## 多态

不同对象对同一函数做出不同的响应

- 编译时静态多态：函数重载、运算符重载、模板
- 运行时动态多态：通过虚函数和继承实现
  - 父类指针或引用可以指向子类成员；指向父类对象只能调用父类函数及子类重写虚函数，要想调用子类函数需要指向子类对象
  - 子类可以重载父类的虚函数；未重载时该函数采用父类实现，重载时该函数采用子类实现


```cpp
void speak(Animal* a) {
    a->makeSound();
    delete a; 
}
speak(new Cat("Fluffy"));
speak(new Dog("Rover"));
```

### 多态模型

当一个类声明了至少一个虚函数（或继承了虚函数），编译器就会为这个类**生成一个唯一的虚函数表**，表中的每个条目指向该类的一个虚函数的实际代码地址。

当你通过父类指针或引用调用虚函数时，通过下面的对象模型找到对应的虚函数表及其虚函数实现。

```txt
+-------------------+
| vfptr (vtable)      |  <- 指向该对象所属类的虚函数表！
+-------------------+
| 成员变量            |
+-------------------+
```

- 虚函数通常内容无用，可用纯虚函数简化；常用于构造抽象类，不可实例化，其子类必须重写，为子类提供公共接口和基本实现

  ```cpp
  virtual void makeSound() const = 0;
  ```

- 当通过父类指针析构子类对象时，会导致子类的析构函数不被调用，从而产生资源泄漏。虚析构会先调用子类析构，再自动调用父类析构
  - 纯虚析构也可以创建抽象类，但必须添加手动的析构逻辑



# C++ 模板

编写与具体类型无关的代码，在编译时由编译器根据实际使用的类型自动生成具体版本（可以重载）

`template <typename T>`：告诉编译器下面这个函数或类里的 `T` 是一个类型占位符，且使用相同的`T`，可以定义多个同名的`T`供不同个对象使用

## 函数模板

```cpp
#include <iostream>
using namespace std;

// 主模板声明
template <typename T>
bool myCompare(T a, T b);

// 精确匹配的普通函数
bool myCompare(int a, int b)
{
    cout << "普通函数被调用" << endl;
    return a != b;
}
 
// 特化模板函数
template <>
bool myCompare<int *>(int *a, int *b)
{
    cout << "特化模板函数被调用" << endl;
    return *a != *b;
}

// 显式实例化
template bool myCompare<int>(int a, int b);

// 泛化模板函数
template <typename T>
bool myCompare(T a, T b)
{
    cout << "泛化模板函数被调用" << endl;
    return a != b;
}

int main()
{
    int x = 1, y = 2;
    myCompare(x, y);      // 自动推导，调用普通函数
    myCompare<>(x, y);    // 自动推导，强制调用模板函数
    myCompare(&x, &y);    // 显示指定，调用特化模板函数
    myCompare<int>(x, y); // 显示指定，调用泛化模板函数
}
```

隐式实例化方法 ：

- 自动推导：类型要一致且可确定，不存在隐式类型转换
- 显示指定：可以隐式类型转换

调用规则：

1. （显示指定模板|空模板）强制调用函数模板
2. 精确匹配的普通函数
3. 特化函数模板/显示实例化
4. 泛化函数模板
5. 类型转换后的普通函数



## 类模板

```cpp
// 含默认类模板
template<typename NameType, typename AgeType = int> 
class Person
{
public:
	Person(NameType name, AgeType age) {
		this->mName = name;
		this->mAge = age;
	}
	void showPerson() {
		cout << "name: " << this->mName << " age: " << this->mAge << endl;
	}
public:
	NameType mName;
	AgeType mAge;
};

// 部分特化类模板
template <typename NameType>
class Person<NameType, int>
{
public:
    Person(NameType name, int age)
    {
        this->mName = name;
        this->mAge = age;
    }
    void showPerson()
    {
        cout << "姓名: " << this->mName << " 年龄: " << this->mAge << endl;
    }
    void func()
    {
        cout << "这是模板的全特化版本" << endl;
    }

public:
    NameType mName;
    int mAge;
};

Person<string> P1("孙悟空", 999);		// 没有自动类型推导
P1.showPerson();
```

```cpp
template<typename T1, typename T2>
class Person {
public:
	Person(T1 name, T2 age);
	void showPerson();
public:
	T1 m_Name;
	T2 m_Age;
};

template<typename T1, typename T2>
Person<T1, T2>::Person(T1 name, T2 age) {
	this->m_Name = name;
	this->m_Age = age;
}
template<typename T1, typename T2>
void Person<T1, T2>::showPerson() {
	cout << "姓名: " << this->m_Name << " 年龄:" << this->m_Age << endl;
}
```

- 类模板隐式实例化方法只允许显示指定
- 特化类模板不需要和主模板成员保持完全一致
- 类模板不具备继承属性

特殊用法：

```cpp
// 非类型参数类模板 常量、引用、指针
template <typename NameType, int N>
class Person
{
public:
    Person(NameType name, int age)
    {
        this->mName = name;
        this->mAge = age;
    }
    void showPerson()
    {
        cout << "name: " << this->mName << " age: " << this->mAge << endl;
    }

public:
    NameType mName;
    int mAge = N;
};

// 嵌套模板
template <template <typename> typename Container, typename T>
class Wrapper
{
private:
    Container<T> data;

public:
    Wrapper(const Container<T> &d) : data(d) {}
    void display()
    {
        for (const auto &item : data)
        {
            cout << item << " ";
        }
        cout << endl;
    }
};

vector<int> v = {1, 2, 3, 4, 5};
Wrapper<vector, int> example(v);
example.display();
```

### 函数参数

- 指定传入的类型


```cpp
void printPerson1(Person<string> &p);
```

- 参数模板化


```cpp
template <typename T1>
void printPerson2(Person<T1> &p);
```

- 整个类模板化


```cpp
template<typename T>
void printPerson3(T & p);
```

### 继承

* 当子类继承的父类是一个类模板时，子类要指定出父类中模板类型

```cpp
class Son :public Base<int>
```

* 如果想灵活指定出父类中T的类型，子类也需变为类模板


```cpp
template<typename T1, typename T2>
class Son :public Base<T2>
```

### 友元

- 全局函数类内实现


```cpp
template<typename T1, typename T2>
class Person
{
	friend void printPerson(Person<T1, T2> & p) {
		cout << "姓名： " << p.m_Name << " 年龄：" << p.m_Age << endl;
	}
    // ...
};
printPerson(p);
```

- 全局函数类外实现


```cpp
template<typename T1, typename T2> class Person;
template<typename T1, typename T2> void printPerson(Person<T1, T2> & p);

template<typename T1, typename T2>
class Person
{
	friend void printPerson<>(Person<T1, T2> & p);
    // ...
};

template<typename T1, typename T2>
void printPerson(Person<T1, T2> & p)
{
	cout << "类外实现 ---- 姓名： " << p.m_Name << " 年龄：" << p.m_Age << endl;
}

printPerson(p);
```

## 举例

```hpp
#pragma once
#include <iostream>
using namespace std;

template<class T>
class MyArray
{
public:
	MyArray() = default;
	MyArray(int capacity) {
		this->m_Size = 0;
		this->m_Capacity = capacity;
		pAddress = new T[this->m_Capacity];
	}
	MyArray(const MyArray & arr) {
		this->m_Size = arr.m_Size;
		this->m_Capacity = arr.m_Capacity;
		this->pAddress = new T[this->m_Capacity];
		for (int i = 0; i < this->m_Size; i++) {
			this->pAddress[i] = arr.pAddress[i];
		}
	}
    ~MyArray() {
		if (this->pAddress != NULL) {
			delete[] this->pAddress;
			this->pAddress = NULL;
			this->m_Capacity = 0;
			this->m_Size = 0;
		}
	}

	MyArray& operator=(const MyArray& myarray) {
		if (this->pAddress != NULL) {
			delete[] this->pAddress;
			this->pAddress = NULL;
			this->m_Capacity = 0;
			this->m_Size = 0;
		}
		this->m_Size = myarray.m_Size;
		this->m_Capacity = myarray.m_Capacity;
		this->pAddress = new T[this->m_Capacity];
		for (int i = 0; i < this->m_Size; i++) {
			this->pAddress[i] = myarray[i];
		}
		return *this;
	}

	T& operator[](int index) {
		return this->pAddress[index]; //不考虑越界，用户自己去处理
	}

	void Push_back(const T & val) {
		if (this->m_Capacity == this->m_Size) {
			return;
		}
		this->pAddress[this->m_Size] = val;
		this->m_Size++;
	}

	void Pop_back() {
		if (this->m_Size == 0) {
			return;
		}
		this->m_Size--;
	}

	int getCapacity() {
		return this->m_Capacity;
	}

	int	getSize() {
		return this->m_Size;
	}

private:
	T * pAddress;  
	int m_Capacity;
	int m_Size;
};
```





# C++ STL

标准数据结构和算法，**容器**和**算法**之间通过**迭代器**进行无缝连接，还有**仿函数**、**适配器**和**空间配置器**。

## 容器

类型：string、vector、deque、stack、queue、list、set、pair、map

方法：构造、赋值、存取、插入、删除、修改、属性

## 算法

遍历、比较、查找、排序、拷贝、替换、交换、算数、集合

## 函数对象

重载**函数调用操作符**的类，类似于函数一样使用，有状态，**可作为参数传递**

```cpp
class MyAdd
{
public :
    MyAdd() {
        this->count=0;
    }
	int operator()(int v1,int v2) {
        this->count++;
		return v1 + v2;
	}
    int count;
};
MyAdd myAdd;
myAdd(10, 10);
// myAdd.count
```

加法plus、减法minus、乘法multiplies、除法divides、取模modulus、取反negate

等于equal_to、不等于not_equal_to、大于greater、大于等于greater_equal、小于less、小于等于less_equal

与logical_and、或logical_or、非logical_not


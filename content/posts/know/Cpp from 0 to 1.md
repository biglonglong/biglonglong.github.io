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
* 第一个字符必须为字母或下划线
* 见名知意



## 数据类型

创建一个对象时，必须要指定出相应的数据类型，表明该对象的大小，范围及其属性。

### 内置类型

| 整型           | 占用         | 取值范围                                        | 示例                                                         |
| -------------- | ------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| short          | 2字节        | (-2^15 ~ 2^15-1)                                | `short num = 1`                                              |
| int            | 4字节        | (-2^31 ~ 2^31-1)                                | `int num = 1`                                                |
| long           | 4字节或8字节 | (-2^31 ~ 2^31-1)                                | `long num = 1`                                               |
| long long      | 8字节        | (-2^63 ~ 2^63-1)                                | `long long num = 1`                                          |
| **字符型**     |              |                                                 |                                                              |
| char           | 1字节        | ASCII编码或其字符集<br>转义字符集(不可显示字符) | `char ch = 'a'`                                              |
| **布尔型**     |              |                                                 |                                                              |
| bool           | 1字节        | true(1)   false(0)                              | `bool flag = true`                                           |
| **浮点型**     |              |                                                 |                                                              |
| float          | 4字节        | 7位有效数字                                     | `float f1 = 3.14`<br>`float f1 = 3.14f`<br/>`float f2 = 3e2` |
| double(双精度) | 8字节        | 15～16位有效数字                                | `double d1 = 3.14`                                           |

> `sizeof( 数据类型 / 对象)`可以统计数据类型或对象所占内存大小

### 自定义类型

#### string [类](./面向对象.md)

通过面向对象特性和属性（如数组、指针、引用、const或static修饰等）自定义数据类型，以字符串为例：

- `string  字符串名 = "字符串值"`：C++风格字符串
- `char 字符串名[] = "字符串值"`：C风格字符串，需要一个字节存储结尾字符`\0`

#### 结构体

通过结构体可以打包相关数据

- `struct 结构体名 { 结构体成员列表 };`：定义结构体
- `结构体名 结构体对象名 = { 成员1值 ， 成员2值...}`：创建结构体
- `结构体对象名.成员`：访问结构体成员
- `结构体对象指针名->成员`：访问结构体指针成员

### 指针

复合类型`基本数据类型 *`，用于保存基本数据类型的内存地址和访问该内存地址的内容

`数据类型 *指针名 = &其他对象`

- 空指针：NULL、nullptr、0；初始化指针，不可访问
- 野指针：指针指向非法的内存空间，不可访问
- `&a`：通过&取地址，得到对象内存地址
- `*p`：通过*解引用，得到指针指向的值
- `const int * p1 = &a`：常量指针，指针指向可以改，指针指向的值不可以更改
- `int * const p2 = &a`：指针常量，指针指向不可以改，指针指向的值可以更改

### 引用

复合类型`基本数据类型 &`，给对象起别名，操作的是同一个对象，本质是指针常量。创建引用时，必须初始化为一个对象且不可更改

`数据类型 &别名 = 原名`

- 函数返回引用可以作为左值，从而修改引用函数内部的对象
- const修饰的引用对象可以初始化为一个字面值

### const修饰

### static修饰

### void类型

### 类型转换

不同内置数据类型之间可以进行强制类型转换

`转换后数据类型 转换后对象 = (转换后数据类型)转换前对象`

不同内置数据类型之间发生运算会进行自动类型转换，如`int -> unsigned`，否则保持旧类型



## 数组

连续存放相同类型数据元素的集合

一维数组定义：

`数据类型  数组名[数组长度] = { 值1，值2 ...}`

`数据类型  数组名[] = { 值1，值2 ...}`

` 数据类型  数组名[数组长度] `

二维数组定义：

`数据类型  数组名[ 行数 ][ 列数 ] = { {数据1，数据2 } ，{数据3，数据4 } }`

`数据类型  数组名[ 行数 ][ 列数 ] = { 数据1，数据2，数据3，数据4}`

` 数据类型  数组名[  ][ 列数 ] = { 数据1，数据2，数据3，数据4}` 

` 数据类型  数组名[ 行数 ][ 列数 ] `

- `数组名[下标]...[下标]`：数组访问
- 数组名理解为`数据类型 * const`指针类型或者`数据类型 _[]`数组类型
  - 通过指针和指针重载的加减运算符能快速得到下一个元素的地址；
  - `sizeof(数组名)`统计整个数组在内存中的长度；
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

### 参数与返回值传递

- 值传递：形参和实参是不同地址空间的对象。如果形参发生变化，并不会影响实参。
- 地址传递：以地址作为参数，形参和实参操作的是同一地址空间。形参可以修改实参的值。
- 引用传递：形参是实参的别名，形参和实参操作的是同一对象。形参可以修改实参的值。

### 参数类型

- `(数据类型 参数= 默认值)`：默认参数，放在参数列表最后，调用时可省略默认，可被修改
  - 如果函数声明有默认值，函数实现的时候就不能有默认参数
- `(数据类型)`：占位参数，调用函数时必须填补该位置，可以有默认值

### 重载

相同的函数名作用于不同的参数类型，提高复用性，可重载条件如下：

* 同一个作用域下
* 函数名称相同
* **函数参数不同**，如类型、长度、顺序、引用与常量引用
  * 函数参数中存在默认参数时容易存在歧义



## 内存分区模型

- 代码区：存放函数体的二进制机器指令，只读共享，由操作系统进行管理的
- 全局区：存放全局变量和静态变量以及常量区存放常量和const修饰全局变量，由操作系统进行管理的
- 栈区：程序运行后，由编译器自动分配释放, 存放函数的参数值,局部变量等，==不要返回局部变量的地址或者引用==
- 堆区：程序运行后，由程序员通过`new`分配和`delete`释放,若程序员不释放，程序结束时由操作系统回收
  - `数据类型 *变量名 = new 数据类型(初始值)`：开辟数据，返回该数据对应的类型的指针
  - `数据类型 *数组名 = new 数据类型[初始大小]`：开辟数组
  - `delete 变量名`：释放数据
  - `delete[] 数组名`：释放数组



## 分文件编写

1. 创建后缀名为.h的头文件 ，引入必要库，说明源文件的声明

2. 创建后缀名为.cpp的同名源文件，引入头文件，定义头文件声明的内容

3. 创建后缀名为.cpp的调用源文件，引入头文件，调用头文件声明

   > 【类模板调用时创建函数】
   >
   > 1. 头文件中可以将声明和实现写在一起，后缀名为.hpp
   > 2. 不再引入头文件而是源文件



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
- private：默认访问权限【struct 默认访问权限为公共权限】，私有权限，类内可以访问，类外不可以访问

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

- 类的成员函数和静态成员供整个类共享，不属于某个对象，仅非静态成员变量才属于单个对象。

- 空对象占用一个字节，非空对象按其成员大小占用，虚继承对象存在一个虚基类指针
- 按代码顺序构造，逆序析构
- **空对象指针也是可以调用成员函数的**。如果调用的成员函数可能用到this指针，需要判断保证代码的健壮性

### 构造函数

为对象自动初始化，可以重载，编译器提供空实现的无参构造和属性复制的拷贝构造和赋值重载

`类名(形参列表){}`

- 如果定义了有参构造函数，编译器不再提供无参构造；如果定义了拷贝构造函数，不再提供其他构造函数
- 当成员属性中存在指针类型，且没有自定义深拷贝构造和赋值【在堆区重新申请空间拷贝指针指向的值】，编译器提供的浅拷贝构造和赋值，只是对指针属性地址的复制，存在重复地址释放的风险。

### 析构函数

为对象自动销毁清理，不可重载，编译器提供空实现的无参析构

`~类名(){`

- 对象按执行顺序构造，按逆序析构；先构造对象成员，再构造本对象，析构相反；

- 当属性中存在堆区数据时，最好在析构函数中`if(p!NULL){delete p; p=NULL;}`


### 修饰

#### this指针

class预定义指针常量，隐含在每个非静态成员中，**指向被调用成员所属的对象**

- 当形参和成员变量同名时，可用this指针来区分
- 在类的非静态成员函数中返回对象本身，可使用**return *this**

#### static修饰成员

在成员变量和成员函数前加上关键字static，**静态成员供类下所有对象共享**

- 静态成员变量要求类内声明，类外初始化
- 静态成员函数只能访问静态成员变量

#### const修饰成员函数

在成员函数参数列表后加上关键字const，**常函数不可以修改成员属性**

- 成员属性声明时加关键字mutable后，在常函数中依然可以修改；

- 常对象只能调用常函数或修改mutable变量

### 友元

有些私有属性让类外一些特殊的函数或者类进行访问

#### 全局函数

```
friend void goodGay(Building * building);
```

#### 类

```
friend class goodGay;
```

#### 成员函数

```
friend void goodGay::visit();
```

### 运算符重载

为适应新类，对运算符像定义函数一样重定义，可重载，可以是全局函数，也可以是成员函数。

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
// 全局函数无法访问类内私有变量，友元化全局函数后可调用

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

呈树型的类关系，下级类（子类）除了拥有上级类（父类）的成员，还有自己独有的成员。

```cpp
#include <iostream>
#include <string>
using namespace std;

class Animal {
public:
	Animal() = default;
	Animal(string name) : name(name) {}
	virtual ~Animal() = default;

	virtual void makeSound() const = 0;
	string getName() const {
		return name;
	}

protected:
	string name;
};

class Dog : public Animal {
public:
	Dog(string name) : Animal(name) {}
	~Dog() = default;

	void makeSound() const override {
		cout << name << " says: Woof!" << endl;
	}
};

class Cat : public Animal {
public:
	Cat(string name) : Animal(name) {}
	~Cat() = default;

	void makeSound() const override {
		cout << name << " says: Meow!" << endl;
	}
};
```

### 继承模型

- 父类所有非静态成员属性都被子类继承，可用`cl /d1 reportSingleClassLayout类名 类所在文件` 检查
- 构造子类时，先构造父类，再构造子类，析构反之

### 继承方式

- public公共继承：保持成员访问权限，无法访问父类的私有成员
- protected保护继承：成员访问权限保护化，无法访问父类的私有成员
- private私有继承：成员访问权限私有化，无法访问父类的私有成员

### 同名成员继承

子类对象访问同名成员，子类同名成员直接访问，父类同名成员使用作用域区分。

### 多继承

` class 子类 ：继承方式 父类1 ， 继承方式 父类2...`

产生菱形继承时，为了解决“孙类继承了爷类两份同属性数据”的问题，父类需要虚继承，即` class 子类 ：virtual 继承方式 父类1`。通过虚基类指针->虚基类表，使得这两份同属性数据指向同一个对象



## 多态

- 静态多态: 函数重载、运算符重载和非虚函数继承，编译阶段确定函数地址
- 动态多态: 虚函数继承，运行阶段确定函数地址

```cpp
void speak(Animal* a) {
    a->makeSound();
    delete a;
}
speak(new Cat("Fluffy"));
speak(new Dog("Rover"));
```

- 虚函数：**父类指针或引用可以指向子类成员**，子类重载的成员函数可以覆盖父类对应的虚函数
  - 父类指针对象只能调用父类接口，要想调用子类接口需要强转为子类

- 抽象类：虚函数通常内容无用，**可用纯虚函数`= 0`简化**
  - 抽象类不可实例化，且其子类必须重写

- 虚析构/纯虚析构：**父类无法释放子类开辟的堆区指针**，采用虚析构/纯虚析构会先调用子类析构，再调用父类析构；
  - 纯虚析构也要有实现


### 多态模型

虚基类有一个指向虚函数表的指针

- 当子类未发生重写，直接继承虚基类的指针和虚函数表
- 当子类发生重写，继承虚基类的指针，并重写虚函数表

### 举例

```cpp
#include<iostream>
using namespace std;

//抽象CPU类
class CPU
{
public:
	virtual void calculate() = 0;
};

//抽象显卡类
class VideoCard
{
public:
	virtual void display() = 0;
};

//抽象内存条类
class Memory
{
public:
	virtual void storage() = 0;
};

//电脑类
class Computer
{
public:
	Computer(CPU * cpu, VideoCard * vc, Memory * mem) {
		m_cpu = cpu;
		m_vc = vc;
		m_mem = mem;
	}

	void work() {
		m_cpu->calculate();
		m_vc->display();
		m_mem->storage();
	}

	~Computer(){
		if (m_cpu != NULL) {
			delete m_cpu;
			m_cpu = NULL;
		}
		if (m_vc != NULL) {
			delete m_vc;
			m_vc = NULL;
		}
		if (m_mem != NULL) {
			delete m_mem;
			m_mem = NULL;
		}
	}

private:
	CPU * m_cpu; //CPU的零件指针
	VideoCard * m_vc; //显卡零件指针
	Memory * m_mem; //内存条零件指针
};

//具体厂商
//Intel厂商
class IntelCPU :public CPU
{
public:
	virtual void calculate() {
		cout << "Intel的CPU开始计算了！" << endl;
	}
};

class IntelVideoCard :public VideoCard
{
public:
	virtual void display() {
		cout << "Intel的显卡开始显示了！" << endl;
	}
};

class IntelMemory :public Memory
{
public:
	virtual void storage() {
		cout << "Intel的内存条开始存储了！" << endl;
	}
};

//Lenovo厂商
class LenovoCPU :public CPU
{
public:
	virtual void calculate() {
		cout << "Lenovo的CPU开始计算了！" << endl;
	}
};

class LenovoVideoCard :public VideoCard
{
public:
	virtual void display() {
		cout << "Lenovo的显卡开始显示了！" << endl;
	}
};

class LenovoMemory :public Memory
{
public:
	virtual void storage() {
		cout << "Lenovo的内存条开始存储了！" << endl;
	}
};


int main()
{
	//第一台电脑零件
	CPU * intelCpu = new IntelCPU;
	VideoCard * intelCard = new IntelVideoCard;
	Memory * intelMem = new IntelMemory;

	cout << "第一台电脑开始工作：" << endl;
	//创建第一台电脑
	Computer * computer1 = new Computer(intelCpu, intelCard, intelMem);
	computer1->work();
	delete computer1;

	cout << "-----------------------" << endl;
	cout << "第二台电脑开始工作：" << endl;
	//第二台电脑组装
	Computer * computer2 = new Computer(new LenovoCPU, new LenovoVideoCard, new LenovoMemory);;
	computer2->work();
	delete computer2;

	cout << "-----------------------" << endl;
	cout << "第三台电脑开始工作：" << endl;
	//第三台电脑组装
	Computer * computer3 = new Computer(new LenovoCPU, new IntelVideoCard, new LenovoMemory);;
	computer3->work();
	delete computer3;

}
```





# C++ 模板

## 函数模板

建立一个通用函数，其函数返回值类型和形参类型可以不具体制定，用一个**虚拟的类型**来代表；每个模板T只能被一个对象使用，可以定义多个同名的T供多个对象使用

```cpp
template <typename T>
bool myCompare(T& a, T& b) {
	return a!=b;
}

int a=1, b=2;
myCompare(a, b);				// 自动推导
myCompare<int>(a, b);			// 显示指定
```

- 模板T自动推导的类型要一致，不存在隐式类型转换
- 模板T要可确定，不确定时要显示指定；显示指定时可以隐式类型转换

### 调用规则

1. 如果函数模板和普通函数都可以实现，优先调用普通函数
2. 可以通过空模板参数列表来强制调用函数模板
3. 函数模板也可以发生重载
4. 如果函数模板可以产生更好的匹配,优先调用函数模板

### 具体化

当符合具体化的函数时，优先调用

```cpp
template<> bool myCompare(Person &p1, Person &p2) {
	return !(p1.m_Name==p2.m_Name && p1.m_Age==p2.m_Age);
}
```



## 类模板

建立一个通用类，类中的成员 数据类型可以不具体制定，用一个**虚拟的类型**来代表。

```cpp
template<class NameType, class AgeType = int> 
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

Person<string>P1("孙悟空", 999);		// 没有自动类型推导
P1.showPerson();
```

```cpp
template<class T1, class T2>
class Person {
public:
	Person(T1 name, T2 age);
	void showPerson();
public:
	T1 m_Name;
	T2 m_Age;
};

template<class T1, class T2>
Person<T1, T2>::Person(T1 name, T2 age) {
	this->m_Name = name;
	this->m_Age = age;
}
template<class T1, class T2>
void Person<T1, T2>::showPerson() {
	cout << "姓名: " << this->m_Name << " 年龄:" << this->m_Age << endl;
}
```

- 普通类中的成员函数一开始就创建，类模板中的成员函数在调用时才创建，未调用的成员函数不参与类型推导
- 每个模板T只能被一个类成员使用，可以定义多个同名的T供多个类成员使用

### 函数参数

1. 指定传入的类型

   ```cpp
   void printPerson1(Person<string> &p);
   ```

2. 参数模板化

   ```cpp
   template <class T1, class T2>
   void printPerson2(Person<T1, T2>&p);
   ```

3. 整个类模板化

   ```cpp
   template<class T>
   void printPerson3(T & p);
   ```

### 继承

* 当子类继承的父类是一个类模板时，子类要指定出父类中T的类型

  ```cpp
  class Son :public Base<int>
  ```

* 如果想灵活指定出父类中T的类型，子类也需变为类模板

  ```cpp
  template<class T1, class T2>
  class Son :public Base<T2>
  ```

### 友元

全局函数类内实现

```cpp
template<class T1, class T2>
class Person
{
	friend void printPerson(Person<T1, T2> & p) {
		cout << "姓名： " << p.m_Name << " 年龄：" << p.m_Age << endl;
	}
    // ...
};
printPerson(p);
```

全局函数类外实现

```cpp
template<class T1, class T2> class Person;
template<class T1, class T2> void printPerson(Person<T1, T2> & p);

template<class T1, class T2>
class Person
{
	friend void printPerson<>(Person<T1, T2> & p);
    // ...
};

template<class T1, class T2>
void printPerson(Person<T1, T2> & p)
{
	cout << "类外实现 ---- 姓名： " << p.m_Name << " 年龄：" << p.m_Age << endl;
}

printPerson(p);
```

### 举例

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

string、vector、deque、stack、queue、list、set、pair、map

构造、赋值、存取、插入、删除、修改、属性

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


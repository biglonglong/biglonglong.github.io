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

## 初始化
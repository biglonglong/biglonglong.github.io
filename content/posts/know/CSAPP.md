---
draft: false

title: "CSAPP"
description: "从程序员视角观察计算机系统"
date: 2025-05-24
author: ["biglonglong"]

tags: ["summary", "八股文", "c"]
summary: ""

math: false
weight:
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

## C程序生命周期

```c
// hello.c
#include <stdio.h>

int main()
{
    printf("Hello, World!\n");
    return 0;
}
```

一个C程序，一般需要经过编辑、编译、运行和退出几个步骤。编译阶段，我们通过如下命令得到可执行目标文件：

```bash
gcc -o hello hello.c
```

可执行目标文件的后缀依系统而定，如Windows下`.exe`，Linux下`.out`。编译系统大致分为：

- 预处理：处理`#`开头的预处理命令，包括宏替换、文件包含和条件编译等操作。
- 编译：通过编译原理（词法分析、语法分析、语义分析、中间代码生成和优化等步骤）生成汇编代码。
- 汇编：根据指令集生成二进制机器代码，再按照固定规则打包成可重定位目标文件（二进制文件）。
- 链接：与其他提前编译好的可重定位目标文件（如库函数等）合并成一个可执行目标文件

$$
Editor						\xrightarrow{hello.c}
Pre\text{-}processor(cpp)  \xrightarrow{hello.i}
Compiler(ccl)  \xrightarrow{hello.s}
Assembler(as)  \xrightarrow{hello.o} \xrightarrow{printf.o}
Linker(ld)		\xrightarrow{hello}
$$

此时就可以将生成的`hello`加载到内存中执行了！

```bash
.\hello
```

------

```cpp
//main.c
#include <stdio.h>

void mulstore(long, long, long *);

int main()
{
    long d;
    mulstore(5, 6, &d);
    printf("5 * 6 --> %ld\n", d);
    return 0;
}

long mult2(long a, long b) {
    long s = a * b;
    return s;
}

// mstore.c
long mult2(long, long);

void mulstore(long x, long y, long *dest) {
    long t = mult2(x, y);
    *dest = t;
}
```

生成汇编代码，通过下面命令实现：

```bash
gcc -Og -S mstore.c
# -Og 最基本编译方式  -S 生成汇编代码mstore.s
```

以`.`开头的行用于之后指导汇编器和链接器工作的伪指令，与汇编无关。

```assembly
	.file	"mstore.c"
	.text
	.globl	mulstore
	.def	mulstore;	.scl	2;	.type	32;	.endef
	.seh_proc	mulstore
mulstore:
	pushq	%rbx
	.seh_pushreg	%rbx
	subq	$32, %rsp
	.seh_stackalloc	32
	.seh_endprologue
	movq	%r8, %rbx
	call	mult2
	movl	%eax, (%rbx)
	addq	$32, %rsp
	popq	%rbx
	ret
	.seh_endproc
	.ident	"GCC: (x86_64-posix-seh-rev0, Built by MinGW-Builds project) 14.2.0"
	.def	mult2;	.scl	2;	.type	32;	.endef
```

生成机器代码，通过下面命令实现，但无法查看：

```bash
gcc -Og -c mstore.c
# -Og 最基本编译方式  -S 生成机器代码mstore.o
```

通过工具`objdump`将机器代码翻译成汇编代码：

```bash
objdump -d mstore.o
```

反汇编得到的代码具有了实际地址，每行汇编指令都对应地址，部分汇编指令的内容转换为实际立即值

```assembly
.\mstore.o:     file format pe-x86-64

Disassembly of section .text:

0000000000000000 <mulstore>:
   0:   53                      push   %rbx
   1:   48 83 ec 20             sub    $0x20,%rsp
   5:   4c 89 c3                mov    %r8,%rbx
   8:   e8 00 00 00 00          call   d <mulstore+0xd>
   d:   89 03                   mov    %eax,(%rbx)
   f:   48 83 c4 20             add    $0x20,%rsp
  13:   5b                      pop    %rbx
  14:   c3                      ret
  15:   90                      nop
...
  1f:   90                      nop
```



## 计算机系统硬件原理

计算机位数一般指总线宽度，也即一个字的大小，目前常见为32bits和64bits。对应地在计算机系统中，程序计数器、寄存器等都是一个字的大小。地址空间也被限制在字长范围内。

64bits机器兼容32bits的程序，通过以下命令，可以生成32bits程序或者64bits程序：

```bash
gcc -m32 -o hello32 hello.c
# hello32可以运行在64bits机器和32bits机器上
```

```bash
gcc -m64 -o hello64 hello.c
# hello64只可以运行在64bits机器上
```

1. 当在键盘上键入字符串`“.\hello”`后，shell程序将字符逐一读入寄存器，再把它存放到内存中
2. 当在键盘上键入回车后，shell程序从磁盘中加载`hello`文件的数据和代码到内存中（DMA不经过CPU）
3. 处理器开始执行`hello`文件`main`中的指令，并将字符串`“Hello, World!\n”`从内存加载到寄存器中，再从寄存器复制到显示设备。

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%B3%BB%E7%BB%9F%E7%A1%AC%E4%BB%B6%E7%BB%84%E6%88%90.jpg" alt="计算机系统硬件组成" style="zoom: 33%;" />

通过网络适配器，网络也可看作一种I/O设备。通过网络，我们可以发送数据到远程系统，就如同发送数据到磁盘上一般。另外，我们也可以在远程系统上运行`hello`程序，如ssh。

1. 当我们在客户端键入字符串`“.\hello”`并回车后，客户端通过网络将其发送到服务端
2. 服务端从网络收到字符串`“.\hello”`和回车后，将其传递给服务端的shell程序，之后的操作就如同在客户端系统上一般
3. 同样，服务端`hello`程序的运行结果不再发送到到服务端的显示设备，而是通过网络发生到客户端的显示设备

### Amdahl’s Law

当对系统某一部分加速时，被加速部分的占比和加速程序是影响整体系统性能的关键因素，其中$\alpha$为被加速部分的占比，k为部分加速比，S为整体加速比。
$$
\begin{equation}
    S = \frac{T_{old}}{T_{new}} = \frac{1}{(1 - \alpha) + \frac{\alpha}{k}}
\end{equation}
$$
提高部件性能，可以提高系统总体的计算能力，一般可以通过：

- 线程级并发
  - 多核芯片：多组CPU结构
  - 超线程芯片：多组PC、寄存器等
- 指令级并行：流水线技术
- 单指令多数据并行：指令集设计
- 存储器层次结构：缓存机制
- 芯片工艺：工作频率

### CPI

每条指令运行的时钟周期数，忽略启动指令时的流水线冗余，假设指令C~i~条，插入气泡C~b~条，则：
$$
CPI=\frac{C_i+C_b}{C_i}=1+\frac{C_b}{C_i}
$$
其中C~b~/C~i~主要取决于平均指令插入气泡数（包括加载指令的数据冒险、跳转和返回指令的控制冒险）

### CPU系统结构抽象

1. 晶体管：一种电子开关，能够快速变换电流的通断，实现逻辑电平0和1的转换
2. 逻辑门：通过少量晶体管的组合与输入和输出端口的设置，形成与、或、非、与非、或非、异或逻辑
3. 功能部件：在真值表、布尔代数的理论基础下，通过逻辑门组合成具有一定功能的电路，多个这样的电路组成多比特输入和输出的功能部件，如多路选择器、锁存器等
4. CPU部件：通常，对上面功能部件的封装能够组成功能更加强大的定制化部件，如寄存器堆、ALU、控制器等
5. 指令集：设计指令集（指令功能码+细分功能码+操作数码集合）和程序执行状态（异常处理），结合控制部件组织CPU部件按以下五个步骤周期运行：
   - 取指令：更新PC，根据PC值将冗余指令从指令内存载入到指令寄存器中，控制器分析指令的功能码，确定其他部件的一系列控制信号（可读、可写、ALU Opcode等），同时输出寄存器码和立即数
   - 译码：根据寄存器码从寄存器堆中取出寄存器数据，输入到ALU中
   - 执行：根据寄存器数据、立即数得到算数逻辑操作结果，设置条件码
   - 访存：以算数逻辑操作结果为地址，将寄存器数据写入内存或者读出数据
   - 写回：根据寄存器码，将算数逻辑操作结果写回到寄存器堆

6. 软件设计：从指令集开始，不断抽象出上层语言，设计复杂系统

### 五级流水线设计

| 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F   | D   | E   | M   | W   |     |     |     |     |
|     | F   | D   | E   | M   | W   |     |     |     |
|     |     | F   | D   | E   | M   | W   |     |     |
|     |     |     | F   | D   | E   | M   | W   |     |
|     |     |     |     | F   | D   | E   | M   | W   |

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/CPU%E7%94%B5%E8%B7%AF%E5%8E%9F%E7%90%86%E5%9B%BE.jpg" alt="CPU电路原理图" style="zoom: 33%;" />

1. 为什么CPU能够按照周期执行，是什么在控制五级流水线的运行顺序？

答：CPU中寄存器仅在时钟信号边沿可以发生变化，组成时序逻辑电路，从而控制CPU按周期进行。事实上，阶段都以寄存器开始，组合逻辑电路结束，寄存器的实现通常使用触发器，只能够在时钟信号边沿时捕获数据。寄存器穿插在组合逻辑电路之间，就好像一道道”定时闸门“，使指令信号以时钟周期为单位，逐个流向下一个阶段，下一个阶段亦同（流水线执行）

------

2. 如何提高CPU系统的吞吐量？

答：在流水线系统中，吞吐量仅取决于各阶段电信号传输延迟的最大值，划分出更多的指令运行阶段以降低最大传输延迟，可以提高系统的吞吐量。但这也不是绝对的，因为过深的阶段容易产生更多更复杂的依赖，为了解决这些依赖可能反而降低CPU性能。

------

3. 指令流水线的冒险有哪些，如何解决？

答：数据冒险和控制冒险，通过插入nop指令、旁路数据转发、分支预测bubble，或者它们的结合方法解决。

- 数据冒险：前一条指令的数据还未访存或写回，下一条指令就开始解码，此时得到的是早前指令设置的内存或寄存器值。
  - 判断依赖：在译码阶段读取寄存器ID值，分别与执行阶段、访存阶段和写回阶段的目的寄存器比较，若相等则存在数据依赖。
  - 插入nop指令：通过在存在依赖的指令之间插入空指令，不执行任何操作，等待前一条指令的数据访存或写回后，再让下一条指令就开始解码。但这降低了指令执行的吞吐量。
  - 旁路：通过设计另外的组合逻辑电路，提前将执行阶段的结果写回到译码阶段读取的寄存器中。保护了流水线的吞吐量。但无法完全解决访存阶段和写回阶段的依赖问题，因为这两个阶段在流水线后期，加入旁路后仍未及时在该条指令执行后且下一条指令译码时更新访问或写回。
- 控制冒险：对于地址跳转相关的指令，需要在前一条指令执行后(分支跳转)、访存后(函数返回ret)才知晓下一条指令的地址，否则总是不跳转。
  - 分支预测：总是不跳转(或者总是跳转)，预测错误后回退状态（此时执行了总是不跳转的两个指令，一个到达取指阶段，一个到达译码阶段，不影响其他指令，直接在下周期的译码阶段和执行阶段插入Bubble占位，从而结束该两条指令的操作）

------

4. 如何通过控制逻辑单元解决组合冒险？

答：stall信号和bubble信号；

- bubble占位信号：是nop指令在流水线中的表现，nop指令是从输入层面来操作，bubble是从控制信号层面来操作。
- stall暂停信号：保持当前流水线某阶段的指令，等待前面bubble疏通

通过两种信号的组合来解决各种冒险，具体不再讨论了。



## 存储器层次结构

由于处理器与存储器之间巨大的频率差异，需要大大缩短从存储器中存取数据的时间，利用程序局部性特点，因而设计了存储器的层次结构，即基于下一层的缓存机制。

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E5%AD%98%E5%82%A8%E5%99%A8%E5%B1%82%E6%AC%A1%E7%BB%93%E6%9E%84.jpg" alt="存储器层次结构" style="zoom:33%;" />

不同存储器采用了不同的存储技术，需要中间件保证兼容性，需要缓存替换算法、合适的逻辑块大小提高缓存命中，降低访存时间（**不同层次之间的逻辑块大小不一样，例如寄存器与L1之间以字为一个块，内存与磁盘之间以页为一个块**）

### 内存

- SRAM：静态随机访问存储器，双稳态六晶体管存储单元结构，供电保持
- DRAM：动态随机访问存储器，单电容单晶体管存储单元结构，供电保持（抗干扰能力弱，漏电刷新机制）

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/DRAM%E7%BB%93%E6%9E%84.jpg" alt="DRAM结构" style="zoom: 50%;" />

一个16(超单元个数) $\times$ 8(超单元bit个数) DRAM芯片，呈阵列结构，地址引脚先发送行地址，将对应行载入内部行缓存区，然后发送列地址，从内部行缓存区取出对应列的超单元数据。这种设计减少了地址引脚位宽，但增加了访问时间。

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E5%86%85%E5%AD%98%E6%A8%A1%E5%9D%97%E7%BB%93%E6%9E%84.jpg" alt="内存模块结构" style="zoom: 50%;" />

内存模块控制器将超单元行列地址广播到每个DRAM芯片上，从而一次性取得一个更长位宽的数据。

### 磁盘

断电保持

#### 机械式

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E7%A3%81%E7%9B%98%E7%BB%93%E6%9E%84.jpg" alt="磁盘结构" style="zoom: 50%;" />

- 磁盘IO时间=寻道时间（旋转磁臂）+旋转时间（旋转盘片）+传输时间（读写头），读取到的数据会被放入缓冲区；
- 数据以扇区为单位读写，每个扇区存储512 bytes有效数据，扇区间隙存储扇区标识信息；
- 一个OS所说的逻辑块（页）对应多个扇区，通过磁盘控制器映射（逻辑块号 -> (盘面, 磁道, 扇区)。

#### 固态式

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/SSD%E7%BB%93%E6%9E%84.jpg" alt="SSD结构" style="zoom:50%;" />

- 访问时间更短，功耗更低，稳定性更强，寿命有限，价格稍贵
- 数据以页为单位读写，以块为单位擦除（将所有位置1），页的大小按规格而定
- 闪存翻译层类似于磁盘控制器，将逻辑块（页）号映射到闪存地址

### 高速缓存

高速缓存由多个组(S)组成，每个组包含多个行(E)，每个行包含一个有效位、一个标记以及一个数据块(B)

高速缓存将m位地址划分为t个标记位、s个组索引位、b个块偏移；对于一个地址，先按组索引确定组，再按标记确定行，继而检查有效位，最后通过块偏移确定数据起始位置；若标记和有效位不匹配，则需要到下一级存储中操作。

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E9%AB%98%E9%80%9F%E7%BC%93%E5%AD%98%E7%BB%93%E6%9E%84.jpg" alt="高速缓存结构" style="zoom:50%;" />

这里高速缓存对地址划分的设计（组索引位不在高位），是为了使得具有空间局部性程序的数据**映射到不同的组中**，从而有利于缓存替换算法不替换空间局部性数据，提高缓存命中

- 直接映射（E=1）：直接替换，易发生冲突不命中
- E路组相联（E>1）：默认替换空行（有效位为0），否则缓存替换策略
- 全相联（S=1，E=C/B）：命中概率更大，但需要搜索算法支持提高访问时间

> 当发生写命中情况时，可写穿透（保证各级存储数据的一致性）或者写回（只写高速缓存，需要额外一致性算法）
>
> 当发生写不命中情况时，可写分配（目标块加载到高速缓存再写）或者写不分配（直接写内存中的目标块）
>
> 通常，写分配与写回搭配，写穿透和写不分配搭配
>
> 上层存储器通常偏向少路组相联和写穿透和写不分配，下层存储器通常多路组相联和写分配与写回



## 信息表示和存储

内存可以理解为字节（8bits 0/1）数组，每个字节的下标就是该内存空间的地址，地址的集合即虚拟地址空间。数据是字节的组织。

| Signed  | Unsigned             | 32bits | 64bits |
| ------- | -------------------- | ------ | ------ |
| char    | unsigned char        | 1      | 1      |
| short   | unsigned short       | 2      | 2      |
| int     | unsigned             | 4      | 4      |
| long    | unsigned long        | 4      | 8      |
| int32_t | uint32_t             | 4      | 4      |
| int64_t | uint64_t             | 8      | 8      |
| char *  |                      | 4      | 8      |
| float   | 浮点型都是有符号数。 | 4      | 4      |
| double  | 浮点型都是有符号数。 | 8      | 8      |

对于某种数据类型，其数据是通过该数据类型的长度和数据的起始地址确定：

- 大端法：最高有效字节存储在最前面（低地址处）
- 小端法：最低有效字节存储在最前面

下面的语句可以打印字节，从而来分析系统默认大小端：

```cpp
#include <stdio.h>

typedef unsigned char *byte_pointer;

void show_bytes(byte_pointer start, size_t len) {
    size_t i;
    for (i = 0; i < len; i++)
        printf("%.2x ", start[i]);
    printf("\n");
}

void show_int(int x) {
    show_bytes((byte_pointer) &x, sizeof(int));
}

int main()
{
    show_int(12345);
    // 0x00003039
    // 小端法: 39 30 00 00
    // 大端法: 00 00 30 39
    return 0;
}
```

### 进制转换

- 十六进制和八进制与二进制之间的转换，分别以4bits和3bits为一组进行转换
- 十六进制、八进制和二进制与十进制之间的转换，分别通过(辗转相除取余倒序排.辗转相乘取整顺序排)和位次相乘求和进行转换

### 位运算

一般位移运算是逻辑位移，补0即可，但对于有符号数会进行算数右移，即右移补符号（最高有效位）

```cpp
#include <stdio.h>

int main() {
    unsigned int a = 60; // 60 = 0011 1100
    unsigned int b = 13; // 13 = 0000 1101
    char result;

    // 位运算
    result = ~a; // NOT运算: 1100 0011
    result = a & b; // AND运算: 0000 1100
    result = a | b; // OR运算: 0011 1101
    result = a ^ b; // XOR运算: 0011 0001
    result = a << 2; // 左移运算: 1111 0000
    result = a >> 2; // 无符号数进行逻辑右移运算: 0000 1111

    // 逻辑运算
    int x = 1; // true
    int y = 0; // false
	result = x && y;  //与逻辑: true
    result = x || y;  //或逻辑: true
    result = !x;	  //f非逻辑: false

    return 0;
}
```

### 整型

#### 编码

- 无符号数（二进制码）：所有w位数都被用于表示数值

- 有符号数（补码）：前w-1位表示数值，最高有效位为符号位，理解为偏置（补数）$-2^{w-1}$的一个标记，且该标记参与运算
  - 符号位为0时，无偏置，此时表示范围内所有非负数；
  - 符号位为1时，偏置了$-2^{w-1}$，将非负数区间移动到数轴0之前，此时表示范围内所有负数


> 补码将符号位引入计算，解决了整型中负数和减法运算的问题，统一为加法电路，从程序员的角度来看，==以二进制形式判断整型的变化就不会出错==。
>
> 为了方便识别负数的补码，有原码、反码和补码的转换规则如下：
> $$
> 原码 \xrightarrow{除符号位取反} 反码 \xrightarrow{加一} 补码 \xrightarrow{除符号位取反}\xrightarrow{加一} 原码（1\underbrace{0 \ldots 0}_{\text{w-1}}除外，表示最小负数）
> $$


#### 转换

无符号数和有符号数之间的转换，二进制保持不变，不同的编码规则，表现为：

- 最高有效位为0，有符号数为非负数，值不变
- 最高有效位为1，有符号数为负数，无符号数 = (有符号数+$2^{w}$)

不同字长的类型之间的转换，二进制保持不变，补充或截断多余位数，表现为：

- 长类型转为短类型，截断前数据 = (截断前数据 mod $2^{w}$）
- 短类型转为长类型，补符号位（默认0），值不变

#### 运算

##### 溢出

当数据的计算结果超过了数据类型对应的范围，就一定发生了**溢出**。

- 无符号数相加溢出，溢出位1且被舍弃，即$2^w$
  $$
  x+^{u}_{w}y=
  \begin{cases}
      x+y\quad \quad \quad \quad x+y<2^w\\
      x+y-2^w\quad 2^w \leq x+y<2^{w+1}
  \end{cases}
  $$
  ```cpp
  int uadd_ok(unsigned x, unsigned y) {
      unsigned sum = x + y;
      return sum>=x;
  }
  ```
  
- 有符号数相加溢出，溢出时改变了符号位，产生两倍偏置
  $$
  x+^{t}_{w}y=
  \begin{cases}
      x+y-2^w\quad \quad 2^{w-1} \leq x+y\\
      x+y\quad \quad \quad \quad -2^{w-1} \leq x+y<2^{w-1}\\
      x+y+2^w\quad \quad x+y<-2^{w-1}
  \end{cases}
  $$
  ```cpp
  int add_nok(int x, int y) {
      int sum = x + y;
      return (x>0 && y>0 && sum<0) || (x<0 && y<0 && sum>0);  
  }
  ```

##### 减法

减去一个数等价于加上它的相反数：
$$
\forall x, y, \quad y - x \equiv y + (-x) \\

-^{u}_{w}x =
\begin{cases}
x & x = 0 \\
2^w - x & x \geq 0
\end{cases}

\quad \quad

-^{t}_{w}x =
\begin{cases}
-x & x > -2^{w-1} \\
-2^{w-1} & x = -2^{w-1}
\end{cases}
$$
由于补码的性质，通过下面方式得到相反数：
$$
补码 \xrightarrow{位取反}\xrightarrow{加一} 相反数补码
$$

无符号数的减法同样通过这样的方式计算。

##### 乘法

> 乘法运算数据长度翻倍，截断多余位数，无符号数（二进制码）乘法截断值和有符号数（补码）乘法截断值相同，统一了整型乘法

乘法等价于被乘数关于乘数各位的逻辑左移之和
$$
x \cdot 2^k \rightarrow x \ll k  \\
\textit{e.g.：}x \cdot 14 \rightarrow x \cdot (2^3+2^2+2^1) \rightarrow (x \ll 3)+(x \ll 2)+(x \ll 1) \\
\rightarrow x \cdot (16-2) \rightarrow (x<<4)-(x<<1)
$$

##### 除法

> 除法除不尽，通过算数右移，统一了整型除法

除法等价于被除数关于除数各位的算数右移之和，但无法表示所有除数
$$
x/2^k \rightarrow x \gg k \\
\textit{e.g.：}-12340/16 \rightarrow -12340 \gg 4 \\
$$
由于除法总是向下舍入，为了使结果总是朝着0的方向舍入，补码负数被除数加入偏置$2^k-1$
$$
(x+2^k-1)/2^k \\

\rightarrow (-12340+15) \gg 4 \rightarrow (-12340 + 1 \ll k-1) \gg k
$$

### 浮点型

一般浮点数定义为：
$$
(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}, \quad \text{e.g.} \ bias=2^{Width\_of\_e-1}-1=0\underbrace{1 \ldots 1}_{\text{Width\_of\_e-1}}
$$
浮点数存储S、f、e二进制标记即可，但为了特殊的表示，有：

- 规格化值：e非全0且非全1
- 非规格化值：E全为0
- 特殊值Inf、NaN：E全为1

具体以s占1位，e占4位，f占3位，bias=7为例：

| s   | e                    | f        | Value=                                                                               |
| --- | -------------------- | -------- | ------------------------------------------------------------------------------------ |
| $0$ | $1111$               | $000$    | $+Inf$                                                                               |
| $0$ | $1110$（规格化）     | $111$    | $(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}=[1.111]_2 \cdot 2^7=[1111]_2 \cdot 2^4$       |
| $0$ | …                    | …        | …                                                                                    |
| $0$ | $0111$（规格化）     | $000$    | $(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}=[1.000]_2 \cdot 2^0=[1000]_2 \cdot 2^{-3}$    |
| $0$ | …                    | …        | …                                                                                    |
| $0$ | $0010$               | $001$    | $(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}=[1.001]_2 \cdot 2^{-5}=[1001]_2 \cdot 2^{-8}$ |
| $0$ | $0010$               | $000$    | $(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}=[1.000]_2 \cdot 2^{-5}=[1000]_2 \cdot 2^{-8}$ |
| $0$ | $0001$（规格化）     | …        | …                                                                                    |
| $0$ | $0001$（规格化）     | $001$    | $(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}=[1.001]_2 \cdot 2^{-6}=[1001]_2 \cdot 2^{-9}$ |
| $0$ | $0001$（规格化）     | $000$    | $(-1)^s \cdot {(1.f)} \cdot 2^{e-bias}=[1.000]_2 \cdot 2^{-6}=[1000]_2 \cdot 2^{-9}$ |
| $0$ | $0000$（非规格化）   | $111$    | $(-1)^s \cdot {(0.f)} \cdot 2^{1-bias}=[0.111]_2 \cdot 2^{-6}=[0111]_2 \cdot 2^{-9}$ |
| $0$ | $0000$（非规格化）   | …        | …                                                                                    |
| $0$ | $0000$（非规格化）   | $010$    | $(-1)^s \cdot {(0.f)} \cdot 2^{1-bias}=[0.010]_2 \cdot 2^{-6}=[0010]_2 \cdot 2^{-9}$ |
| $0$ | $0000$（非规格化）   | $001$    | $(-1)^s \cdot {(0.f)} \cdot 2^{1-bias}=[0.001]_2 \cdot 2^{-6}=[0001]_2 \cdot 2^{-9}$ |
| $0$ | $0000$（非规格化）   | $000$    | $(-1)^s \cdot {(0.f)} \cdot 2^{1-bias}=+0.0$                                         |
| $1$ | $0000$（非规格化）   | $000$    | $(-1)^s \cdot {(0.f)} \cdot 2^{1-bias}=-0.0$                                         |
| $1$ | $11111111$（特殊值） | $000$    | $-Inf$                                                                               |
| $?$ | $11111111$（特殊值） | ！$ 000$ | $NaN$                                                                                |

- 非规格化数和最小阶数规格化数精度相同，之后随着阶码的增大，精度也随之降低，最小精度为$2^{1-bias-Width\_of\_f}$，最大精度为$2^{2^{Width\_of\_e-1}-1-Width\_of\_f}$
- 有效位数由尾数的宽度决定，但又受到精度的影响
- 范围在$(-2^{bias+1},2^{bias+1})$，最后的边界取不到且间隔一个最大精度

| type       | Width of s | Width of e | Width of f | bias | E=e-bias       |
| ---------- | ---------- | ---------- | ---------- | ---- | -------------- |
| float(32)  | 1          | 8          | 23         | 127  | $(-126, 127)$  |
| double(64) | 1          | 11         | 52         | 1023 | $(-1022,1023)$ |

| Valid Nums                     | Min accuracy | Max accuracy | Range                   |
| ------------------------------ | ------------ | ------------ | ----------------------- |
| $2^{23 }\rightarrow 6 \sim 7$  | 2^-149^      | 2^104^       | $(-2^{128}, 2^{128})$   |
| $2^{52 }\rightarrow 15\sim 16$ | 2^-1074^     | 2^971^       | $(-2^{1024}, 2^{1024})$ |

#### 舍入

IEEE754浮点数无法精确表示实数，采用向偶数舍入，最低有效位0为偶数，最低有效位1为奇数

如$[10.11100]_2$精确到小数点后两位，则$11.00000]_2$

> 由于舍入和精度递减的原因，导致一个小数和大数相加，小数丢失在大树的精度里而被舍入
>
> - 浮点型不具备结合律和分配律
> - 浮点型不建议将小数和大数进行操作

#### 转换

整型—>浮点数的转换，遵循科学计数法的原理

其实就是从左向右找到第一个1，向后打浮点，剩余的位数即尾数，阶码和符号迎刃而解。

> - [ ] int -> float：小概率被舍入
> - [ ] float/double -> int：丢失小数部分（向零舍入），或溢出
> - [ ] double -> float：或丢失精度（向偶数舍入），或溢出
> - [x] int/float -> double：提高精度



## 函数调用

Inter-x86-64函数调用栈机制，程序栈从高地址到低地址，栈顶指针总是指向当前栈最低地址

### 寄存器

#### 通用寄存器

下表是同一寄存器的不同长度表示：

| 63       | 31   | 15  | 7    | Func                     |
| -------- | ---- | --- | ---- | ------------------------ |
| **%rax** | %eax | %ax | %al  | 函数返回值，被调用者保存 |
| %rbx     | %ebx | %bx | %bl  | 被调用者保存             |
| %rcx     | %ecx | %cx | %cl  | 调用者保存参数4          |
| %rdx     | %edx | %dx | %dl  | 调用者保存参数3          |
| %rsi     | %esi | %si | %sil | 调用者保存参数2          |
| %rdi     | %edi | %di | %dil | 调用者保存参数1          |
| %rbp     | %ebp | %bp | %bpl | 被调用者保存             |
| **%rsp** | %esp | %sp | %spl | 栈顶指针                 |
| %r8      |      |     |      | 调用者保存参数5          |
| %r9      |      |     |      | 调用者保存参数6          |
| %r10     |      |     |      | 调用者保存               |
| %r11     |      |     |      | 调用者保存               |
| %r12     |      |     |      | 被调用者保存             |
| %r13     |      |     |      | 被调用者保存             |
| %r14     |      |     |      | 被调用者保存             |
| %r15     |      |     |      | 被调用者保存             |

#### 条件码寄存器

CPU-ALU会将最近一次运算的标志位载入条件码寄存器

- CF：Carry Flag进位标志，检查无符号运算是否溢出
- ZF：Zero Flag零标志，检查最近一次运算的结果是否为0
- SF：Sign Flag符号标志，检查近一次运算的结果的符号
- OF：Overflow Flag溢出标志，检查有符号运算是否溢出

#### 指令指针寄存器

`%rip`：存储下一条指令的地址

### 指令

#### 操作数

- 立即数：指其表示的字面值，如`$0x20`、`$32`、`$0o40`、`$0b100000`、…
- 寄存器：指寄存器存储的内容，如`%rax`、`%r8`、`%eax`、…
- 内存引用：`Immeidate(Base Register, Index Register, Scale Factor)`，指引用地址$Imm+R[r_b]+R[r_i] \cdot s, s \in [1,2,4,8]$的内容，`Scale Factor`理解为字节数

#### 操作码

> 汇编指令操作码后缀`b`、`w`、`l`、`q`，表示目标寄存器或者地址大小，指令中要求保持一致；当源操作数小于目的操作数时，目的操作数剩余位进行零扩展或者符号扩展
>
> | C declaration | Inter data type  | Assembly-code suffix | Size(bytes) |
> | ------------- | ---------------- | -------------------- | ----------- |
> | char          | Byte             | b                    | 1           |
> | short         | Word(16bits)     | w                    | 2           |
> | int           | Double Word      | l                    | 4           |
> | long          | Quad Word        | q                    | 8           |
> | char *        | Quad Word        | q                    | 8           |
> | float         | Single precision | s                    | 4           |
> | double        | Double precision | l                    | 8           |

- `mov? source, Destination`：移动`Source`到`Destination`，两者不能同时是内存引用

  - `movq $Imm, Register`：`Imm`只能是32bits，`Register`对应的高32bits采用符号位扩展
  - `movabsq $Imm, Register`：`Imm`是64bits
  - `movzwq Source, Destination`：零扩展，源操作数大小为`w`，目的操作数大小为`q`
  - `movl $Imm, Register`：载入32bits`Imm`到`Register`后，零扩展
  - `movslq Source, Destination`：符号扩展，源操作数大小为`l`，目的操作数大小为`q`
  - `cltq %eax, %rax`：等价于`movslq %eax, %rax`

- `pushq %rax`：压栈，等价于`sub $8, %rsp`，`movq %rax, (%rsp)`

- `popq %rbx`：弹栈，等价于`movq (%rsp), %rbx`，`addq $8, $rsp`

- `leaq Source, Destination`：加载有效地址（非内存引用）或者加法运算或者乘法运算或者数组定址

- `cmp? Source, Destination`：以Destination-Source的算数操作设置条件码寄存器

- `test? Source, Destination`：以Destination&Source的算数操作设置条件码寄存器

- `set? %al`：根据条件码寄存器的值设置`%al`的值

  | Instruction | Condition        | Description |
  | ----------- | ---------------- | ----------- |
  | sete %al    | ZF               | =           |
  | setg %al    | \~(SF^OF) & \~ZF | Signed >    |
  | setge %al   | ~(SF^OF)         | Signed >=   |
  | setl %al    | SF^OF            | Signed <    |
  | setle %al   | (SF^OF)\|ZF      | Signed <=   |
  | seta %al    | \~CF & \~ZF      | Unsigned >  |
  | setae %al   | ~CF              | Unsigned >= |
  | setb %al    | CF               | Unsigned <  |
  | setbe %al   | CF\|ZF           | Unsigned <= |

- `j? .[label]`：根据条件码寄存器的值进行`%rip`跳转到`[label]`或否，具体`?`同上，构成if、while语句

- `jmp .[label]`：无条件跳转到`[label]`，构成switch跳转表

- `cmov? Source, Destination`：根据条件码寄存器的值进行数据传送，具体`?`同上，适合分支预测编译器的if语句

> 一些算数指令：
>
> - `inc? D`：D自增1
> - `dec? D`：D自减1
> - `neg? D`：D取负
> - `not? D`：D取补
> - `add? S, D`：D=D+S
> - `sub? S, D`：D=D-S
> - `imul? S, D`：D=D*S
> - `xor? S, D`：D=D^S
> - `or? S, D`：D=D|S
> - `and? S, D`：D=D&S
> - `sal? k, D`：D=D<<k
> - `shl? k, D`：D=D<<k
> - `sar? k, D`：D=D>>k，算数右移，补符号
> - `shr? k, D`：D=D>>k，逻辑右移，补0
> - 查阅指令手册…

### 过程栈

函数mulstore调用函数mult2，函数mult2执行完后返回函数mulstore；但函数所执行所需要的存储空间超出寄存器能够存放的大小时，数据将被放在栈帧中暂存

```assembly
mulstore:
    push   %rbx
    # 将%rbx的当前值压入栈中，以便在函数执行完毕后能够恢复%rbx的原始值（实参）
    sub    $0x20,%rsp
    # 为函数参数分配栈空间，调整栈顶指针%rsp
    mov    %r8,%rbx
    # 参数赋值，将%r8参数传递给%rbx
    call   mult2
    # 调用函数，设置%rip到mult2标记处
    mov    %eax,(%rbx)
    # 解引用赋值，将%eax的值移动到%rbx指针指向的空间中
    add    $0x20,%rsp
    # 恢复栈空间，调回栈顶指针%rsp
    pop    %rbx
	# 将%rbx的原始值从栈中弹出，恢复%rbx的值（实参）
	ret
	# 函数返回

mult2:
	mov    %ecx,%eax
	imul   %edx,%eax
	ret
```

当函数mulstore中即将调用函数mult2，函数mulstore及更早函数调用的栈帧暂时被挂起，然后被调用者`push %rbx`，保存一些调用者的局部变量，之后开始创建函数mult2的栈帧

1. `subq $0x20,%rsp`：分配栈空间传递函数参数
2. 前六个参数分别传递给`%rdi`、`%rsi`、`%rdx`、`%rcx`、`%r8`、`%r9`。其余部分以8bytes为单位，从后向前依次传递给栈帧
3. `call mult2`
   - 将指令指针寄存器`%rip`跳转到函数mult2的指令位置
   - 将下一条指令地址（返回地址）压入栈帧中
4. 执行函数mult2直到`ret`：将返回地址从栈帧中弹出，存入指令指针寄存器`%rip`，继续执行函数mulstore
5. `add $0x20,%rsp`：取消函数mult2的栈帧，恢复到函数mulstore的栈帧
6. `pop %rbx`：被调用者保存，恢复一些调用者的局部变量



## C结构

### 数组A

- 一维数组

  - 取地址：`&A[i]`等价于`A+i`，其中i关于类型长度的比例因子在C中被重载入`+`号中
  - 访问：`A[i]`等价于`*(A+i)`，即对地址的引用

- 二维数组（行优先）

  - 取地址：`&A[i][j]`等价于`A+(C*i+j)`，其中C*i+j关于类型长度的比例因子在C中被重载入`+`号中
  - 访问：`A[i][j]`等价于`*(A+C*i+j)`，即对地址的引用

- 矩阵运算

  ```cpp
  #define N 10
  typedef int fix_matrix[N][N];
  
  int multi_matrix(fix_matrix A, fix_matrix B, long i, long k) {
      long j;
      long result = 0;
      for (j = 0; j < N; j++) {
          result += A[i][j] * B[j][k];
      }
      return result;
  }
  ```

- Malloc动态数组：可声明一个非常量的定长数组

  - 在C层面上，性质与定长数组保持一致，但由于数组大小可变而方便泛型编程
  - 在汇编层面上，由于数组宽度是变量，在计算二维数组地址时采用乘法而非立即数，具有更好的编译优化

#### 缓冲区溢出

对数组的引用不会进行任何边界检查，如果对数组（缓冲区）的越界部分进行写操作，就会破坏栈帧中的状态信息（比如返回地址），从而遭受病毒攻击，预防方法有：

- 栈随机化：操作系统在程序每次运行时，分配栈的位置都有变化
- 栈破坏检测：编译器在汇编代码中加入一种机制`%fs`来检测缓冲区越界：在压入数组内容前，先压入一个随机只读特殊值（金丝雀值）；在函数返回前检查金丝雀值是否被修改` xorq`。
- 限制可执行代码区域：消除攻击者插入可执行代码的能力，限制栈可读可写不可执行

### 结构体

打包数据为一种类型

```cpp
struct rec {
	int i;
    char c;
	int j;
}; // 12 bytes
```

- 访问：起始地址+访问成员偏移量
- 数据对齐：为了提高内存系统的性能，任何K字节的基本对象的地址必须是K的倍数，解决方法是在对象之间填充空字段
  - 为了减小结构体的大小，结构体成员排列建议从大字节对象到小字节对象
  - 结构体组成的数组也要满足数据对齐原则，因此末端也要加上填充

### 联合体

不同字段互斥，同样大小空间可表现为某一种类型

```cpp
union U3 {
    char c;
    int a[2];
    double v;
}; // 8 bytes

typdef enum {N_LEAF, N_INTERNAL} nodetype_t;
struct node_t {
    nodetype_t type;
    union {
        struct {
            struct node_t *left;
            struct node_t *right;
        } internal;
        int value;
    } info;
}; // tree, 24bytes

unsigned long double2bits(double d) {
    union {
        double d;
        unsigned long u;
    } temp;
    temp.d = d;
    return temp.u;
}
```



## 程序优化

程序的性能有CPU结构（流水线并行、并行执行单元）、并行化程度、裁剪设计（算法和数据结构）等有关，但不会低于其延迟界限或者吞吐量界限（OP和IO）

另外，不同的编译级别会产生不同程度的机器代码，通过下面命令实现：

```bash
gcc -Og -o prog main.c mstore.c
# -Og 生成符合原始C代码整体结构的机器代码
```

```bash
gcc -O1 -o prog main.c mstore.c
# -O1 编译优化
```

```bash
gcc -O2 -o prog main.c mstore.c
# -O2 进一步编译优化
```

### 优化能力和局限性

为了防止语义变化，编译器可能限制如下情况的优化：

1. 减少内存引用（内存别名引用时歧义）
2. 减少函数调用（操作全局变量时歧义）

因此，在书写高级语言程序时，就应该确定语义并进行优化处理

```cpp
typedef int data_t;
typedef struct {
    long len;
    data_t *data;
} *vec_ptr;
#define IDENT 0
#define OP +

void combine1(vec_ptr v, data_t *dest) {
    long i;
    data_t *data = get_vec_address(v);
    *dest = IDENT;
    for(i=0; i<vec_length(v); i++) {
        *dest = *dest OP data[i];
    }
}
```

### 不变量外提

减少不变量的重复计算

```cpp
void combine2(vec_ptr v, data_t *dest) {
    long i;
    long length = vec_length(v);
    data_t *data = get_vec_address(v);
    *dest = IDENT;
    for(i=0; i<length; i++) {
        *dest = *dest OP data[i];
    }
}
```

### 减少内存引用

减少内存IO

```cpp
void combine3(vec_ptr v, data_t *dest) {
    long i;
    long length = vec_length(v);
    data_t *data = get_vec_address(v);
    data_t acc = IDENT;
    for(i=0; i<length; i++) {
        acc = acc OP data[i];
    }
    *dest = acc;
}
```

### 循环展开

减少循环操作开销

```cpp
void combine4(vec_ptr v, data_t *dest) {
    long i;
    long length = vec_length(v);
    long limit = length - 1;
    data_t *data = get_vec_address(v);
    data_t acc = IDENT;
    for(i=0; i<limit; i+=2) {
        acc = (acc OP data[i]) OP data[i+1];
    }
    for(; i<length; i++) {
        acc = acc OP data[i];
    }
    *dest = acc;
}
```

#### 同操作执行单元多路并行

```cpp
void combine5(vec_ptr v, data_t *dest) {
    long i;
    long length = vec_length(v);
    long limit = length - 1;
    data_t *data = get_vec_address(v);
    data_t acc0 = IDENT;
    data_t acc1 = IDENT;
    for(i=0; i<limit; i+=2) {
        acc0 = acc0 OP data[i];
        acc1 = acc1 OP data[i+1];
    }
    for(; i<length; i++) {
        acc0 = acc0 OP data[i];
    }
    *dest = acc0 OP acc1;
}
```

#### 异操作执行单元多路并行

```cpp
void combine6(vec_ptr v, data_t *dest) {
    long i;
    long length = vec_length(v);
    long limit = length - 1;
    data_t *data = get_vec_address(v);
    data_t acc = IDENT;
    for(i=0; i<limit; i+=2) {
        acc = acc OP (data[i] OP data[i+1]);
    }
    for(; i<length; i++) {
        acc = acc OP data[i];
    }
    *dest = acc;
}
```

#### 减少内存数据相关

内存读写相关、内存写读相关、内存写写相关，会卡住汇编代码的运行顺序，从而卡住多路并行

> 如果是寄存器间的数据相关，会被流水线并行算法优化



## 链接

### 编译与链接

链接就是通过链接器将**可重定位目标文件**以及**必要的系统文件**组合组合成一个**可执行目标文件**，整合了符号信息；链接可形成分文件编写、模块化编译、作用域等特性。

通过如下命令可以编译链接多个c代码文件：

```bash
gcc -Og -o program main.c sum.c
```

等价于：

```bash
# 预处理
cpp -o main.i main.c
cpp -o sum.i sum.c
```

```bash
# 编译
cc -S -o main.s main.i
cc -S -o sum.s sum.i
```

```bash
# 汇编
as -o main.o main.s
as -o sum.o sum.s
```

```bash
# 链接
ld -static -o program main.o sum.o */crt1.o */crti.o ...
```

最后通过shell调用操作系统中的加载器函数，加载器将program中的代码和数据复制到内存中，然后将CPU的控制权转移到program程序开头，开始执行：

```bash
./program
```

### 可重定位目标文件

#### 结构

通过`readelf`工具命令查看可重定位目标文件不同部分的内容：

- ELF header：整个ELF格式文件的信息头，如文件类型、文件位数、字节序、版本号、header大小、section header位置和大小

```bash
readelf -h main.o
```

- Sections：机器代码(.text)、初始化全局区(.data)、未初始化全局占位(.bss|common)、常量区(.rodata)、版本信息(.comment)、**符号表(.symtab)**、**重定位表(.rel.text .rel.data)**、调试信息(.debug)、编译映射(.line)、字符串表(.strtab)

  > 未初始化的全局变量和静态变量为了节省内存空间，不会被记录在程序文件中，而是当程序运行时，参考符号表，在内存中分配这些变量，并初始化为0。

```bash
objdump -s -d main.o
```

- Section header table：每一个Section的信息头，如section偏移和大小

```bash
readelf -S main.o
```

##### 符号表

符号表中包含了程序使用的各种符号信息，与sections内容相对应，包括函数名、全局变量名和静态变量名，但不包括位于栈中局部变量

```bash
readelf -s main.o
```

- 全局符号：该模块定义，能被任何模块引用
  - 外部符号：其他模块定义，能被该模块引用
- 局部符号：该模块定义，只能被该模块引用，即**static属性修饰，隐藏模块内部的变量和函数声明**。

##### 静态库

以`.a`结尾，是一个可重定位目标文件的集合，通过`objdump`可以检查其内容：

```bash
objdump -t /usr/lib/x86_64-linux-gun/libc.a
```

可以被解压：

```bash
ar -x usr/lib/x86_64-linux-gun/libc.a
```

下面是一个构建静态库的例子：

```bash
ar rcs libvec.a addvec.o mulvec.o
```

接着写一个头文件，声明静态库中的函数原型；在主程序中使用头文件，并在链接时加入静态库，即可生成可执行目标文件：

```bash
gcc -static -o program main.o libvec.a
```

除此之外，其他默认静态库由gcc自动加入。

##### 共享库

以`.so`结尾，一种特殊的可重定位目标文件，可以被加载到任意地址，可以与内存中的程序链接。

下面是一个构造共享库的例子：

```bash
gcc -shared -fpic -o libvec.so addvec.c mulvec.c
```

动态链接共享库生成可执行目标文件：

```bash
gcc -o program main.c libcvec.so
```

此时，libcvec.so的代码和数据并没有被重定位到program中，只重定位了一些符号表和重定位信息，还包括一个名为.interp的section，用于存储动态链接器的路径。

运行可执行目标文件：

```bash
./program
```

加载器检测到名为.interp的section，通过路径加载动态链接器到内存运行，然后由动态链接器执行重定位代码和数据的工作，之后将控制器转交给program程序。

除此之外，还可以实现运行时加载和链接共享库：

```c
// 动态加载共享库，生成文件句柄
void *dlopen(const char *filename, int flag);
// 重定位符号引用，返回符号地址
void *dlsym(void *handle, char *symbol);
// 接下来可以正常调用引进的符号了
symbol(**args);
// 卸载共享库
int dlclose(void *handle);
```

#### 解析

汇编时遇到一个未定义符号（**声明**）时，会假设为外部符号，在其他模块定义；

链接器按命令中可重定位目标文件或静态库文件的顺序扫描：

- 对于可重定位目标文件，逐个加入目标文件集合、更新未定义符号集合和加入已定义符号集合；
- 对于静态库文件，扫描其中所有的可重定位目标文件，加入已定义符号集合，如果更新了未定义符号集合，则将该可重定位目标文件加入到目标文件集合；

> ==符号解析==：
>
> - 未定义符号集合不为空，则未找到外部符号的定义，此时报错；
> - 已定义符号集合存在重复，则存在多重定义的全局符号，考虑强符号（函数和已初始化的全局变量）和弱符号（未初始化的全局变量）；
>   - 多个强符号：重定义报错
>   - 一个强符号和多个弱符号：无视数据类型，所有文件采纳强符号
>   - 多个弱符号：无视数据类型，所有文件采纳其中一个弱符号
>
> ```bash
> # gcc标记，链接器遇到多重定义的全局符号时触发错误
> -fno-common
> ```
>
> **链接顺序对符号解析结果有影响**，一般来说，要求按照逆拓扑排序链接。

**合并**目标文件集合为可执行目标文件，为每个符号分配运行时**地址**。

1. 重定位sections：sections按照section类型合并，同时分配运行时地址
2. 重定位符号引用：根据重定位条目替换符号引用为实际地址

> 汇编器对于位置不确定的符号引用时，产生一个重定位条目，告诉链接器在合成可执行目标文件时如何修改符号引用为实际地址
>
> ```c
> typedef struct {
>  long offset;					// 符号引用偏移
>  long type:32, symbol:32;		// 重定位类型，重定位符号
>  long addend;					// 偏移调整
> } ELF64_Rela;
> ```
>
> 1. 计算符号引用运行时地址 = ADDR(基准地址) + offset，基准地址为.text section的运行时地址
> 2. 计算符号定义运行时地址 = 
>    - R_X86_64_PC32：PC相对地址，ADDR(符号地址) - 符号引用地址 + addend
>    - R_X86_64_32：绝对地址，ADDR(符号地址) + addend
> 3. 将符号引用地址的内容修改为实际地址

### 可执行目标文件

#### 结构

- ELF header：整个ELF格式文件的信息头，还包括程序入口地址
- segment header table：描述代码段、数据段偏移、大小和对齐优化，以及与内存映射的关系
  - 未初始化全局占位(.bss)的空间要被记录在这里
- Sections：_init函数(.init)、机器代码(.text)、常量区(.rodata)、初始化全局区(.data)、未初始化全局占位(.bss|common)、符号表(.symtab)、调试信息(.debug)、编译映射(.line)、字符串表(.strtab)
- Section header table：每一个Section的信息头，如section偏移和大小

#### 加载

![](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6%E5%8A%A0%E8%BD%BD.png)

- 由于数据段地址对齐要求，代码段和数据段之间存在间隙
- 为了防止程序被攻击，分配栈、共享库和堆地址时，链接器使用地址空间随机化策略

加载器运行时，将可执行目标文件的代码和数据从磁盘复制到内存中，产生如图右中的排布，

接下来，加载器跳转到程序入口函数`_start()`，由ctrl.o定义，`_start()`调用系统启动函数`_libc_start_main()`，由libc.so定义，用于初始化执行环境，`_libc_start_main()`调用用户主函数`main()`，其返回值由`_libc_start_main()`处理，最后将控制器交还操作系统。



## 异常控制流

当处理器检测到有异常事件发生时，会根据其异常类型（异常编号）从异常表中检索到对应的异常处理程序，处理器会从当前应用程序切换到异常处理程序，当异常处理完成后，根据异常类型可能：

- 将控制权返回异常前正在执行的指令
- 将控制权返回异常前正在执行的下一条指令
- 终止异常前正在执行的程序

异常处理需要硬件和软件的紧密配合，系统启动时，某特殊寄存器会存储异常表的地址，发生异常时，根据异常表地址（基址）+异常编号（变址）得到异常表项，即对应的异常处理程序地址，从而执行异常处理程序，类似于函数调用，但存在操作系统用户态到内核态的切换，而用户态状态压入内核栈中。

### 异常

| 硬件异常类型      | 事件                | 同步/异步 | 返回类型                                               |
| ----------------- | ------------------- | --------- | ------------------------------------------------------ |
| 中断（Interrupt） | 外部I/O设备         | 异步      | 异常前正在执行的下一条指令                             |
| 陷阱（Trap）      | CPU指令（系统调用） | 同步      | 异常前正在执行的下一条指令                             |
| 故障（Fault）     | CPU指令（错误情况） | 同步      | 可修复时重新执行引发故障的指令，否则终止引发故障的程序 |
| 中止（Abort）     | CPU指令（致命错误） | 同步      | 终止引发中止的程序                                     |

| 异常编号 | 描述                                                           | 类型              |
| -------- | -------------------------------------------------------------- | ----------------- |
| 0        | Divide error（除0操作）                                        | Fault             |
| 13       | General protection fault（段错误，未知内存引用或写只读文本段） | Fault             |
| 14       | Page fault（缺页）                                             | Fault             |
| 18       | Machine check（机器检查，硬件错误）                            | Abort             |
| 32-255   | OS-defined exceptions（系统操作，文件读写等）                  | Interrupt or Trap |

### 进程

当运行一个可执行程序，系统会创建一个进程来执行这个程序，进程是对整个程序执行的抽象。

- 并发执行：不同进程交替占用同一个CPU内核，直到结束
- 并行执行：不同进程运行在不同CPU内核上同时执行

为了限制应用程序执行特殊指令以及访问特殊地址空间，处理器通过控制寄存器的模式位来实现权限级别转换：

- 内核模式：执行指令集任何指令，访问内存任何位置
- 用户模式：不允许执行特权指令（I/O、模式改变、停止处理器等），不允许引用内核内存区域，否则发生异常故障，但可以通过异常陷阱间接访问部分内核内存区域。

#### 上下文切换

通常，进程处于用户模式，通过异常进入内核模式，执行异常处理程序；

若该异常处理程序与CPU非相关（磁盘I/O操作），内核发生进程调度，回到用户模式运行另外一个进程；

直到该异常处理程序发出异常，再次进入内核模式，内核再次发生进程调度，回到用户模式运行原进程；

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2.png" alt="上下文切换" style="zoom:67%;" />

进程的切换需要保持状态（上下文），包括：目的寄存器、浮点寄存器、程序寄存器、用户栈、状态寄存器、内核栈和各种内核数据结构（页表、进程表、文件信息表）

当内核选择一个新的进程运行时，即上下文切换，分为三步：

1. 保持当前进程的上下文；
2. 恢复即将执行进程的上下文；
3. 将控制权传递给恢复的进程执行。

==总的来说，系统是一个内核控制、通过异常切换的状态机==。

#### 进程生命周期

从程序员角度来看，进程的状态：

- Running（运行），在CPU上执行或等待被内核调度
- Stopped（暂停），被挂起且无法被内核调度，但可由信号控制其运行
- Terminated（终止），永远不运行，由信号、主函数结束、exit退出导致

父进程通过系统调用`fork`函数来创建一个子进程。

```cpp
pid_t fork(void);
```

函数`fork`被调用一次，但会返回两次，一次在父进程返回，一次在子进程返回。

```cpp
int main() {
	pid_t pid;
    int x = 1;
    pid = fork();		// fork后生成子进程
    if(pid == 0) {
        printf("child:x=%d\n", ++x);
    } else {
        printf("father:x=%d\n", --x);
    }
    exit(0);
}
```

fork前由父进程执行；

fork时，产生与此时**父进程的副本**，即子进程，父进程中返回子进程id，子进程返回0；

fork后，父进程和子进程**独立**执行之后的代码，且因内核调度（并发或并行），无法确定printf顺序。

> `execve`函数可调用加载器加载可执行程序
>
> ```cpp
> int execve(const char *filename, const char *argv[], const char *envp[]);
> ```
>
> <img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E7%A8%8B%E5%BA%8F%E6%A0%88%E8%B5%B7%E5%A7%8B%E7%BB%93%E6%9E%84.png" alt="程序栈起始结构" style="zoom:50%;" />
>
> ------
>
> 进程被终止时，起初作为僵死进程存在，此时依旧消耗系统内存资源，直到被父进程回收，回收的顺序也是无法确定的
>
> 父进程可以通过`waitpid`函数等待子进程并优先回收
>
> ```cpp
> pid_t waitpid(pid_t pid, int *statusp, int options);
> ```

### 信号

一种更高层次的软件异常，允许内核和进程以信号的形式通知其他进程或进程组中断，进入信号处理函数中

产生信号的事件包括：

- 用/bin/kill 程序发送信号

  ```bash
  /bin/kill -9 -15213
  ```

- 键盘发生信号

  - ctrl+C可终止前台进程组，ctrl+Z可挂起前台进程组

- 用kill函数发送信号

  ```cpp
  int kill(pid_t pid, int sig);
  ```

- 用alarm函数发送信号

  ```cpp
  unsigned int alarm(unsigned int secs);
  ```

当进程处于用户模式时，检查进程的未阻塞的待处理信号集合并接收信号，触发信号处理函数，处理完后返回：

- 进程终止
- 进程终止并转储
- 进程挂起
- 信号忽略

> 1. 待处理信号集合中同类型信号会被丢弃
> 2. 信号处理程序可以被其他异常处理程序中断



## 系统级I/O

## 网络编程

## 并发编程


---
draft: false

title: "GDB Record"
description: "GDB 快速入门教程"
date: 2025-12-22
author: ["biglonglong"]

tags: ["summary", "tools", "gdb", "linux"]
summary: ""

math: false
weight: 403
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



[**GDB Documentation**](https://sourceware.org/gdb/documentation/)

## 零、快速参考

| 场景           | 常用命令                                              |
| -------------- | ----------------------------------------------------- |
| 启动调试       | `gdb ./program`                                       |
| 命令行操作     | `shell <命令>`                                        |
| 查看源码       | `list`, `layout src`                                  |
| 设置断点       | `break <位置>`                                        |
| 设置日志       | `set logging on`                                      |
| 运行程序       | `run args`                                            |
| 单步执行       | `step`, `next`, `stepi`、`continue`                   |
| 函数退出       | `finish`                                              |
| 查看内存       | `x/<格式> <地址>`                                     |
| 查看寄存器     | `info registers`                                      |
| 查看调用栈     | `backtrace`                                           |
| 查看符号值     | `print [&]<符号>`                                     |
| 持续查看符号值 | `display [&]<符号>`、`undisplay <ID>`、`info display` |
| 修改符号值     | `set <符号>=<值>`                                     |
| 退出GDB        | `quit`                                                |



## 一、GDB 基础使用

### 1. 启动与运行
```bash
# 启动GDB调试程序
gdb ./program

# 静默模式(直接进入调试界面) 启动
gdb -q ./program

# 附加到正在运行的进程(暂停目标进程，中途调试程序)
./program &
gdb -q -p <PID>
# 或者
gdb -q                  # 然后在GDB内：attach <PID>

# core dump
gdb ./program ./core.<file>
```

### 2. 程序控制
```bash
# 运行程序（带参数）
run arg1 arg2

# 查看崩溃信息
backtrace  # 或 bt

# 继续执行
continue   # 或 c

# 单步调试
step       # 进入函数内部
next       # 不进入函数
stepi      # 执行一条汇编指令
nexti      # 下一条汇编指令（不进入函数）

# 退出当前函数
finish

# 前进到指定位置
advance <位置>  # 可以是函数名、行号或文件名:行号
```



## 二、调试符号管理

### 1. 编译时添加调试信息
```bash
# 使用GCC编译时添加调试符号
gcc -ggdb program.c -o program   # GDB专用格式
gcc -g program.c -o program      # 系统默认格式
```

### 2. 调试符号操作
```bash
# 提取调试符号到单独文件
objcopy --only-keep-debug <binary> <debugfile>

# 将调试符号附加到二进制文件
objcopy --add-gnu-debuglink=<debugfile> <binary>

# 从二进制文件中剥离调试符号
strip --strip-debug <binary>          # 仅移除调试符号
strip --strip-debug --strip-unneeded <binary>  # 移除所有非必要信息
```

### 3. 在GDB中使用调试符号
| 命令                  | 功能                                   |
| --------------------- | -------------------------------------- |
| `list [行号]`         | 查看源代码                             |
| `info sources`        | 列出所有源文件                         |
| `info functions`      | 列出所有函数                           |
| `info variables`      | 列出全局变量                           |
| `info scope <函数名>` | 查看函数内的局部变量                   |
| `info files`          | 查看程序段信息（.text, .data, .bss等） |
| `symbol-file <文件>`  | 加载符号文件                           |



## 三、断点管理

### 1. 设置断点
```bash
break <函数名>          # 在函数处设置断点
break *<内存地址>       # 在指定地址设置断点
break <行号>           # 在指定行设置断点
break <文件名>:<行号>  # 在指定文件的指定行设置断点
```

### 2. 断点操作
```bash
info breakpoints        # 查看所有断点
disable <断点ID>        # 禁用断点
enable <断点ID>         # 启用断点
delete <断点ID>         # 删除断点
clear                   # 删除所有断点
```

### 3. 条件断点与观察点
```bash
# 条件断点
break <位置>
condition <断点ID> <条件>  # 如：condition 1 $eax != 0

# 观察点（监控变量变化）
watch <变量>      # 变量被写入时中断
rwatch <变量>     # 变量被读取时中断
awatch <变量>     # 变量被读或写时中断
info watch        # 查看所有观察点
```



## 四、内存与寄存器操作

### 1. 查看内存
```bash
# x命令格式：x/<数量><格式><大小> <地址>
x/s <地址>        # 显示字符串
x/i <地址>        # 显示指令
x/10xw <地址>     # 显示10个32位字（十六进制）
x/10xg <地址>     # 显示10个64位双字（十六进制）

# 常用查看指令
x/10i $pc         # 查看下10条指令
x/5c argv[1]      # 查看字符串的5个字符
```

### 2. 寄存器操作
```bash
info registers        # 查看寄存器
info all-registers    # 查看所有寄存器
set $<寄存器> = <值>   # 修改寄存器值
```

### 3. 内存修改
```bash
# 修改指定内存位置 	set {char} 0xbffff7e6 = 'A'
set {char} <地址> = '字符'
set {int} <地址> = <值>	

# 修改变量值	set sum = 2000
set <变量名> = <值>
```



## 五、变量与函数调用

### 1. 便利变量
```bash
set $var = 10                     # 创建整数变量
set $str = "hello"               # 创建字符串变量
set $arr = (char *)malloc(100)   # 分配内存

# 修改变量
set argv[1] = $str
```

### 2. 函数调用
```bash
call <函数名>(参数)              # 调用程序中的函数
call strcpy($dest, $src)        # 调用库函数

# 调用示例
call AddNumbers(10, 20)
call AddNumbers($i, $j)
```



## 六、汇编调试

### 1. 反汇编与语法
```bash
disassemble <函数名>            # 反汇编函数
disassemble main               # 反汇编main函数

# 切换汇编语法风格
set disassembly-flavor intel    # Intel语法
set disassembly-flavor att      # AT&T语法（默认）
```

### 2. 汇编调试技巧
```bash
layout asm                     # 进入汇编布局模式
disp/i $pc                     # 每一步显示下一条指令
stepi                          # 执行一条汇编指令
```



## 七、其他工具

### 1. nm工具 - 查看符号
```bash
nm ./program                   # 查看程序符号
nm -a ./program | grep <函数>   # 查找特定符号
nm -n                          # 按地址排序显示
nm -g                          # 显示外部符号
nm -S                          # 显示符号大小

# 符号类型说明
# A - 绝对符号      B - BSS段      D - 数据段
# N - 调试符号      T - 代码段     U - 未定义符号
```

### 2. strace - 系统调用跟踪
```bash
strace ./program               # 跟踪程序系统调用
strace -o output.txt ./program # 输出到文件
strace -p <PID>                # 附加到运行进程
strace -c ./program            # 统计系统调用使用情况

# 过滤特定系统调用
strace -e write ./program
strace -e connect,recv,send ./program
```



## 八、TUI模式（文本用户界面）

```bash
gdb ./program -tui              # 启动TUI模式

# TUI模式命令
layout asm                      # 显示汇编代码
layout src                      # 显示源代码
layout split                    # 同时显示源码和汇编
layout reg                      # 显示寄存器
tui reg general                 # 显示通用寄存器
focus <窗口名>                  # 切换焦点窗口
winheight <值>                  # 调整窗口高度
```



## 九、实战场景

### 1. 逆向分析程序
```bash
# 1. 查看程序字符串
strings ./program

# 2. 查看函数和变量
info functions
info variables

# 3. 分析关键函数
disassemble <关键函数>
break <关键函数>
```

### 2. 修改二进制文件
```bash
# 启用写入模式
gdb --write -q ./program
# 或者在GDB内
set write on

# 修改二进制指令
set {unsigned char}0x4004b9 = 0x90  # 改为NOP指令
```


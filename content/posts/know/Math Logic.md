---
draft: false

title: "Math Logic"
description: "命题逻辑、谓词逻辑、集合、关系、代数系统"
date: 2023-06-15
author: ["biglonglong"]

tags: ["summary", "math"]
summary: ""

math: true
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

## 命题逻辑

- 命题：对错确定的陈述语句
  - 对错确定：该语句表达的意思要么对，要么错，不可以对错不确定（悖论）

------



- 复合命题：简单命题+联结词

  - 合取$\wedge$    
  - 析取$\vee$：注意p$\vee$q 和（p$\wedge$$\neg$q）$\vee$（$\neg$p$\wedge$q）的区别

  - 否定$\neg$
  - 条件$\rightarrow$ : 仅1$\rightarrow$0 为0

  - 双条件$\leftrightarrow$：同1反0

------



- 命题公式书写规则
  - 原子公式（单个命题变元、命题常元）合法
  - 若p合法，则(p)、$\neg$p合法
  - 若p、q合法，则p$\wedge$q、p$\vee$q、p$\rightarrow$q、p$\leftrightarrow$q合法（依次为优先级）
  - 有限次使用上述规则产生的公式合法

------



- 等值式 ：相同的变元取值下，结果相同

  - 利用真值表可证明等值式

    |            |                                                              |
    | ---------- | ------------------------------------------------------------ |
    | 条件式     | p$\rightarrow$q  $\Leftrightarrow$  $\neg$p$\vee$q  $\Leftrightarrow$  $\neg$q$\rightarrow$$\neg$p |
    | 双条件     | p$\leftrightarrow$q  $\Leftrightarrow$  (p$\rightarrow$q)$\wedge$(q$\rightarrow$p)  $\Leftrightarrow$  ($\neg$p$\vee$q)$\wedge$(p$\vee$$\neg$q )  $\Leftrightarrow$  (p$\wedge$q)$\vee$($\neg$p$\wedge$$\neg$q) |
    | 德摩律     | $\neg$(p$\wedge$q)  $\Leftrightarrow$  $\neg$p$\vee$$\neg$q               $\neg$(p$\vee$q)  $\Leftrightarrow$  $\neg$p$\wedge$$\neg$q |
    | 分配律     | p$\wedge$(q$\vee$r)  $\Leftrightarrow$  (p$\wedge$q)$\vee$(p$\wedge$r)      p$\vee$(q$\wedge$r)  $\Leftrightarrow$  (p$\vee$q)$\wedge$(p$\vee$r) |
    | 吸收律     | p$\wedge$(p$\vee$q)  $\Leftrightarrow$  p                         p$\vee$(p$\wedge$q)  $\Leftrightarrow$  p |
    | 双重否定律 | p  $\Leftrightarrow$  $\neg$$\neg$p                          |
    | 幂等律     | p  $\Leftrightarrow$  p$\wedge$p  $\Leftrightarrow$  p$\vee$p |
    | 交换律     | p$\wedge$q  $\Leftrightarrow$  q$\wedge$p                           p$\vee$q  $\Leftrightarrow$  q$\vee$p |
    | 结合律     | p$\wedge$(q$\wedge$r)  $\Leftrightarrow$  (p$\wedge$q)$\wedge$r             p$\vee$(q$\vee$r)  $\Leftrightarrow$  (p$\vee$q)$\vee$r |
    | 常量定律   | 0$\vee$p  $\Leftrightarrow$  p      1$\vee$p  $\Leftrightarrow$  1      p$\vee$$\neg$p  $\Leftrightarrow$  1      0$\wedge$p  $\Leftrightarrow$  0      1$\wedge$p  $\Leftrightarrow$  p      p$\wedge$$\neg$p  $\Leftrightarrow$  0 |

  - 命题公式化简步骤

    1. 转换条件式

       |                     |                                               |
       | ------------------- | --------------------------------------------- |
       | p$\rightarrow$q     | $\neg$p$\vee$q                                |
       | p$\leftrightarrow$q | ($\neg$p$\vee$q) $\wedge$ (p$\vee$$\neg$q)    |
       | p$\leftrightarrow$q | (p$\wedge$q) $\vee$  ($\neg$p$\wedge$$\neg$q) |

    2. 否定到底

       |                        |                          |
       | ---------------------- | ------------------------ |
       | $\neg$$\neg$p          | p                        |
       | $\neg$  (p $\wedge$ q) | $\neg$p $\vee$ $\neg$q   |
       | $\neg$  (p $\vee$ q)   | $\neg$p $\wedge$ $\neg$q |

    3. 恰当使用其他规律：分配律、吸收律、幂等律、交换律、结合律


------



- 范式

  - 小项：按序合取变元组成元组，代表该m项序号下结果为1，原1反0

    - 主析取范式：小项之析取，代表所有成真元组的集合，有成真元组则结果为真，否则为假

    | 值   | $\neg$p$\wedge$$\neg$q$\wedge$$\neg$r | $\neg$p$\wedge$$\neg$q$\wedge$r | $\neg$p$\wedge$q$\wedge$$\neg$r | $\neg$p$\wedge$q$\wedge$r | p$\wedge$$\neg$q$\wedge$$\neg$r | p$\wedge$$\neg$q$\wedge$r | p$\wedge$q$\wedge$$\neg$r | p$\wedge$q$\wedge$r |
    | ---- | ------------------------------------- | ------------------------------- | ------------------------------- | ------------------------- | ------------------------------- | ------------------------- | ------------------------- | ------------------- |
    | 000  | 1                                     | 0                               | 0                               | 0                         | 0                               | 0                         | 0                         | 0                   |
    | 001  | 0                                     | 1                               | 0                               | 0                         | 0                               | 0                         | 0                         | 0                   |
    | 010  | 0                                     | 0                               | 1                               | 0                         | 0                               | 0                         | 0                         | 0                   |
    | 011  | 0                                     | 0                               | 0                               | 1                         | 0                               | 0                         | 0                         | 0                   |
    | 100  | 0                                     | 0                               | 0                               | 0                         | 1                               | 0                         | 0                         | 0                   |
    | 101  | 0                                     | 0                               | 0                               | 0                         | 0                               | 1                         | 0                         | 0                   |
    | 110  | 0                                     | 0                               | 0                               | 0                         | 0                               | 0                         | 1                         | 0                   |
    | 111  | 0                                     | 0                               | 0                               | 0                         | 0                               | 0                         | 0                         | 1                   |
    | 记作 | m~000~                                | m~001~                          | m~010~                          | m~011~                    | m~100~                          | m~101~                    | m~110~                    | m~111~              |

  - 大项：按序析取变元组成元组，代表该M项序号下结果为0，原0反1

    - 主合取范式：大项之合取，代表所有成假元组的集合，有成假元组则结果为假，否则为真

    | 值   | p$\vee$q$\vee$r | p$\vee$q$\vee$$\neg$r | p$\vee$$\neg$q$\vee$r | p$\vee$$\neg$q$\vee$$\neg$r | $\neg$p$\vee$q$\vee$r | $\neg$p$\vee$q$\vee$$\neg$r | $\neg$p$\vee$$\neg$q$\vee$r | $\neg$p$\vee$$\neg$q$\vee$$\neg$r |
    | ---- | --------------- | --------------------- | --------------------- | --------------------------- | --------------------- | --------------------------- | --------------------------- | --------------------------------- |
    | 000  | 0               | 1                     | 1                     | 1                           | 1                     | 1                           | 1                           | 1                                 |
    | 001  | 1               | 0                     | 1                     | 1                           | 1                     | 1                           | 1                           | 1                                 |
    | 010  | 1               | 1                     | 0                     | 1                           | 1                     | 1                           | 1                           | 1                                 |
    | 011  | 1               | 1                     | 1                     | 0                           | 1                     | 1                           | 1                           | 1                                 |
    | 100  | 1               | 1                     | 1                     | 1                           | 0                     | 1                           | 1                           | 1                                 |
    | 101  | 1               | 1                     | 1                     | 1                           | 1                     | 0                           | 1                           | 1                                 |
    | 110  | 1               | 1                     | 1                     | 1                           | 1                     | 1                           | 0                           | 1                                 |
    | 111  | 1               | 1                     | 1                     | 1                           | 1                     | 1                           | 1                           | 0                                 |
    | 记作 | M~000~          | M~001~                | M~010~                | M~011~                      | M~100~                | M~101~                      | M~110~                      | M~111~                            |

  - 命题公式主范式化

    - 根据真值表写出所有小项之析取（原1反0）或者大项之合取（原0反1）
    - 采用等值演算
      1. 先消除条件式，其中双条件要根据需要进行析取变换还是合取变换
      2. 再否定到底，再使用分配律拆分析取和合取、吸收律等化简
      3. 最后拆分类项为小项或大项（实质是添加1[q$\vee$ $\neg$q]或者0[q$\wedge$ $\neg$ q]后进行分配律以根据需要变换为析取或者合取）

------



- 命题逻辑推理

  - 若p为真时r为真，则p$\Rightarrow$r
  - 利用等值演算或真值表证明p$\rightarrow$r永真为1，则p$\Rightarrow$r
  
  | 推理规则                                                     | 解释                                 |
  | ------------------------------------------------------------ | ------------------------------------ |
  | p$\wedge$(p$\rightarrow$q)$\Rightarrow$q（MP假言）           | 条件式条件成立，结果成立             |
  | p$\Rightarrow$p$\vee$q                                       | 本身为真，则包含自身的集合中一定有真 |
  | p$\wedge$q $\Rightarrow$p,q  p,q $\Rightarrow$p$\wedge$q     | 两个命题为真，则它们的整体为真       |
  | (p$\rightarrow$q)$\wedge$(q$\rightarrow$r)$\Rightarrow$(p$\rightarrow$r) | 推理传递                             |
  | p$\Rightarrow$(q$\rightarrow$r) $\Leftrightarrow$ p$\wedge$q$\Rightarrow$r | 附加条件前置                         |
  | $(p \vee r) \wedge (q \vee \neg r) \Rightarrow p \vee q$     | 消解                                 |
  
  - 命题公式组推理技巧：利用推理规则和等值式（德摩、分配、吸收、交换、结合）
  
    - 找到条件式，再找到条件式的条件进行推理
  
      | $\neg$p$\vee$ q $\Leftrightarrow$ p$\rightarrow$q $\Leftrightarrow$ $\neg$q $\rightarrow$ $\neg$p |
      | ------------------------------------------------------------ |
      | p$\vee$ q $\Leftrightarrow$ $\neg$ p$\rightarrow$q           |
      | p $\leftrightarrow$ q $\Leftrightarrow$ (p $\rightarrow$ q) $\wedge$ (q $\rightarrow$ p) |
  

    - **反证**：假设结论的否定为真，在前提下使用推理和等值产生矛盾，则结论为真

  
    - 消解

------





## 谓词逻辑

- 含量词的自然语言符号化：个体变元+动词谓语

  - 个体域：通过谓语函数限制
  - 全称量词 $\forall$x，一般配合$\rightarrow$，意为：任何x,如果x在某个范围，则满足谓词
  - 存在量词 $\exist$x，一般配合$\wedge$，意为：存在x，x既在某个范围，又满足某个谓词

> 对某个谓词公式，不同的个体域、不同的解释，会有不同的True/False 

------



- 谓词公式合法性

  - 原子公式【R(x1,x2,x3,…)n元谓词， ti为项【个体常元与个体变元及其函数式】，R(t1,t2,t3,…）为原子公式】合法
  - 若A合法，则（A）、$\neg$A合法
  - 若A,B合法，则A$\wedge$B，A$\vee$B，A$\rightarrow$B，A$\leftrightarrow$B合法
  - 若A合法，则$\forall$xA、$\exist$xA合法
  - 有限次使用上述规则的公式合法

------



- 谓词公式类型
  - 永真式：在任何解释下都为真
  - 永假式：在任何解释下都为假
  - 可满足式：至少存在一种解释为真

> 不可在有限步骤内判断谓词公式类型

------



- 谓词等值

  - 对于个体域为有限集D={a~1~，a~2~，…，a~n~}有：

    - $\forall$xA(x)  $\Leftrightarrow$  A(a~1~) $\wedge$ A(a~2~) $\wedge$ … $\wedge$ A(a~n~)
    - $\exist$xA(x)  $\Leftrightarrow$  A(a~1~) $\vee$ A(a~2~) $\vee$ … $\vee$ A(a~n~)

  - 命题永真(假)式对应的代换实例也是永真(假)式

    | x~0~是论域中的任一个体 | $\forall$xA(x)  $\Leftrightarrow$  A(x~0~) |
    | ---------------------- | ------------------------------------------ |
    | c是论域中某一特定个体  | $\exist$xA(x)  $\Leftrightarrow$  A(c)     |

  - 个体变元身份(指导变元、辖域、约束变元、自由变元)修改

    - 逆序观察
    - 约束变元+自由变元：修改约束变元名字
    - 约束变元+约束变元：修改晚辈名字

  - 量词作用域

    | $\neg$$\forall$xA(x) $\Leftrightarrow$ $\exist$x$\neg$A(x)   | $\neg$$\exist$xA(x) $\Leftrightarrow$ $\forall$x$\neg$A(x)   |
    | ------------------------------------------------------------ | ------------------------------------------------------------ |
    | $\forall$x (A(x)$\wedge$B(x)) $\Leftrightarrow$ $\forall$xA(x) $\wedge$ $\forall$xB(x) | $\exist$x (A(x)$\vee$B(x)) $\Leftrightarrow$ $\exist$xA(x) $\vee$ $\exist$B(x) |
    | $\forall$x(A(x)$\vee$B) $\Leftrightarrow$ $\forall$xA(x) $\vee$ B | $\exist$x(A(x)$\vee$B) $\Leftrightarrow$ $\exist$xA(x) $\vee$ B |
    | $\forall$x(A(x)$\wedge$B) $\Leftrightarrow$ $\forall$xA(x) $\wedge$ B | $\exist$x(A(x)$\wedge$B) $\Leftrightarrow$ $\forall$xA(x) $\wedge$ B |

------



- 前束范式：量词提前，可消去量词
  1. 代换实例替换条件和双条件
  2. 德摩否定到底
  3. 量词辖域扩展和收缩提前量词

------



- 谓词逻辑推理

  - 谓词逻辑的公理

  
  | $\forall$xA(x)$\vee$$\forall$xB(x)  $\Rightarrow$ $\forall$(A(x)$\vee$B(x)) |
  | ------------------------------------------------------------ |
  | $\exist$x(A(x)$\wedge$B(x))   $\Rightarrow$  $\exist$xA(x)$\wedge$$\exist$xB(x) |
  
  - 谓词逻辑的等值式，*具体见上一知识点*
  
  - 命题逻辑采用代换实例后的推理规则
  
  
  | 推理规则                                                     | 解释                                 |
  | ------------------------------------------------------------ | ------------------------------------ |
  | A$\wedge$(A$\rightarrow$B)$\Rightarrow$B（MP假言）           | 条件式条件成立，结果成立             |
  | A$\Rightarrow$A$\vee$B                                       | 本身为真，则包含自身的集合中一定有真 |
  | A$\wedge$B $\Rightarrow$A,B  A,B $\Rightarrow$A$\wedge$B     | 两个命题为真，则它们的整体为真       |
  | (A$\rightarrow$B)$\wedge$(B$\rightarrow$C)$\Rightarrow$(A$\rightarrow$C) | 推理传递                             |
  | A$\Rightarrow$(B$\rightarrow$C) $\Leftrightarrow$ A$\wedge$B$\Rightarrow$C | 附加条件前置                         |
  | $(A \vee C) \wedge (B \vee \neg C) \Rightarrow A \vee B$     | 消解                                 |
  | A$\Rightarrow$C  $\Leftrightarrow$ A,$\neg$C$\Rightarrow$矛盾 | 矛盾                                 |

  - 命题逻辑采用代换实例后的等值式
  
  
  | 等值标志   | 等值变换                                                     |
  | ---------- | ------------------------------------------------------------ |
  | 条件式     | p$\rightarrow$q  $\Leftrightarrow$  $\neg$p$\vee$q  $\Leftrightarrow$  $\neg$q$\rightarrow$$\neg$p |
  | 双条件     | p$\leftrightarrow$q  $\Leftrightarrow$  (p$\rightarrow$q)$\wedge$(q$\rightarrow$p)  $\Leftrightarrow$  ($\neg$p$\vee$q)$\wedge$(p$\vee$$\neg$q )  $\Leftrightarrow$  (p$\wedge$q)$\vee$($\neg$p$\wedge$$\neg$q) |
  | 德摩律     | $\neg$(p$\wedge$q)  $\Leftrightarrow$  $\neg$p$\vee$$\neg$q               $\neg$(p$\vee$q)  $\Leftrightarrow$  $\neg$p$\wedge$$\neg$q |
  | 分配律     | p$\wedge$(q$\vee$r)  $\Leftrightarrow$  (p$\wedge$q)$\vee$(p$\wedge$r)      p$\vee$(q$\wedge$r)  $\Leftrightarrow$  (p$\vee$q)$\wedge$(p$\vee$r) |
  | 吸收律     | p$\wedge$(p$\vee$q)  $\Leftrightarrow$  p                         p$\vee$(p$\wedge$q)  $\Leftrightarrow$  p |
  | 双重否定律 | p  $\Leftrightarrow$  $\neg$$\neg$p                          |
  | 幂等律     | p  $\Leftrightarrow$  p$\wedge$p  $\Leftrightarrow$  p$\vee$p |
  | 交换律     | p$\wedge$q  $\Leftrightarrow$  q$\wedge$p                           p$\vee$q  $\Leftrightarrow$  q$\vee$p |
  | 结合律     | p$\wedge$(q$\wedge$r)  $\Leftrightarrow$  (p$\wedge$q)$\wedge$r             p$\vee$(q$\vee$r)  $\Leftrightarrow$  (p$\vee$q)$\vee$r |
  | 常量定律   | 0$\vee$p  $\Leftrightarrow$  p      1$\vee$p  $\Leftrightarrow$  1      p$\vee$$\neg$p  $\Leftrightarrow$  1      0$\wedge$p  $\Leftrightarrow$  0      1$\wedge$p  $\Leftrightarrow$  p      p$\wedge$$\neg$p  $\Leftrightarrow$  0 |


------





## 集合

- 集合的运算与性质

  - $\subseteq$ 包含（子集）

  - P(A)={A的所有子集A~i~~j~…~k~的集合(2^|A|^)} 幂集

  - $\subsetneq$ 真子集

  - = 相等（$\subseteq$ 且 $\supseteq$）

  - $\cap$ 交 

  - $\cup$ 并

  - – 差

  - $\bigoplus$ 对称差

  - $\neg$ 补

  - $\in$ 属于

  | 公式名    | 公式                                                         |
  | --------- | ------------------------------------------------------------ |
  | 德摩律    | $\neg$ (A $\cap$ B)=$\neg$ A $\cup$ $\neg$ B 、$\neg$ (A $\cup$ B)=$\neg$ A $\cap$ $\neg$ B |
  | 分配律    | A $\cup$ (B $\cap$ C) = (A $\cup$ B) $\cap$ (A $\cup$ C) 、A $\cap$ (B $\cup$ C) = (A $\cap$ B) $\cup$ (A $\cap$ C) |
  | 吸收律    | A $\cap$(B $\cup$ A) = A = A $\cup$ (B $\cap$ A)             |
  | 结合律    | A$\cup$B$\cup$C=A$\cup$(B$\cup$C)  、A$\cap$B$\cap$ C = A $\cap$(B$\cap$C) |
  | 交换律    | A$\cup$B=B$\cup$A  、 B$\cap$A=A $\cap$B                     |
  | 同一\零律 | A$\cup$$\empty$=A、   A $\cap$$\empty$=$\empty$              |
  | 排中\矛盾 | A $\cup$ $\neg$A = U 、  A$\cap$ $\neg$A= $\empty$           |
  | 冥等律    | A $\cap$A=A 、A $\cup$A=A                                    |
  | 双重否定  | $\neg$$\neg$A=A                                              |

------



- 集合计数

  - Venn图+方程

  - 包含容斥原理（加奇数个集合之交，减偶数个集合之交）、对称差
    $$
    \sum_{k=1}^{m}(-1)^{k-1}\sum_{1\le i_1<i_2<...<i_k \le m} \left|A_{i_1} \cap A_{i_2} \cap ... \cap A_{i_k}   \right|=\left|\bigcup_{i=1}^{m}A_i \right|=\left |A_1 \cup A_2 \cup ...\cup A_m  \right|
    $$

    $$
    =\sum_{1 \le i \le m}|A_i|-\sum_{1 \le i<j \le m}|A_i \cap A_j| + \sum_{1 \le i<j<k \le m}|A_i \cap A_j \cap A_k| - ... + (-1)^{m-1}|A_1 \cap A_2 \cap ...\cap A_m|
    $$

------





## 关系

- 序偶：有次序的两个对象


- n元组：如果<x~1~,x~2~,…,x~n-1~>是n-1元组，而<<x~1~,x~2~,…,x~n-1~>,x~n~>是序偶，则<x~1~,x~2~,…,x~n~>是n元组

- 直积A$\times$B：{<$\forall$a(a$\in$A),$\forall$b(b$\in$B)>}

  | 公式名 | 公式(采用互为子集的相等证明)                                 |
  | ------ | ------------------------------------------------------------ |
  | 分配律 | A$\times$(B $\cup$ C)=A$\times$B$\cup$A$\times$C   A$\times$(B$\cap$C)=A$\times$B$\cap$A$\times$C |
  |        | (B$\cup$C)$\times$A=B$\times$A$\cup$C$\times$A   (B $\cap$C)$\times$A=B$\times$A$\cap$C$\times$A |
  | 包含   | A$\subseteq$B$\Leftrightarrow$A$\times$C$\subseteq$B$\times$C$\Leftrightarrow$C$\times$A$\subseteq$C$\times$B |
  |        | A$\subseteq$B,C$\subseteq$D$\Leftrightarrow$A$\times$C$\subseteq$B$\times$D |

------



- 关系：直积子集，元组元素间存在一定关系 <x,y>$\in$R
  1. 语义描述
  2. 枚举
  3. 关系矩阵：有关系定1，无关系定0
  4. 关系图：关系中源节点和目标节点连接箭头

------



- 复合关系

  - 有序的自然连接：F$^{\circ}$G={<x,y>|$\exist$ t <x,t> $\in$ F,<t,y> $\in$ G)}   

    - M(F°G)=M(F)$^{\circ}$M(G)（其中+变$\vee$，*变$\wedge$)

  - 关系的逆：F^-1^={<y,x>|<x,y> $\in$ F}

    | 公式名   | 公式                                                    |
    | -------- | ------------------------------------------------------- |
    | 结合律   | （P$^{\circ}$R）$^{\circ}$S=P$^{\circ}$（R$^{\circ}$S） |
    | 复合的逆 | （P$^{\circ}$R）^-1^=R^-1^$^{\circ}$P^-1^               |

------



- 关系的分类

  - 恒等关系I~A~ 

    only have $\forall$x $\in$ A，<x,x> 

  - 全域关系E~A~

    R=A$\times$A

  - 自反关系

    $\forall$x（x $\in$ A $\rightarrow$ <x,x> $\in$R）$\Leftrightarrow$ I~A~$\subseteq$ R  $\Leftrightarrow$ 主对1/节点自旋

  - 反自反关系

    $\forall$x（x $\in$ A $\rightarrow$ <x,x> $\notin$R）$\Leftrightarrow$ I~A~  $\cap$ R = {} $\Leftrightarrow$主对0/节点无自旋

  - 对称关系

    $\forall$<x,y> （<x,y> $\in$ R $\rightarrow$  <y,x> $\in$ R）$\Leftrightarrow$R=R^-1^$\Leftrightarrow$ 对角线镜像/全双向箭头

  - 反对称关系

    $\forall$<x,y> （<x,y> $\in$ R $\wedge$ x$\not=$y $\rightarrow$ <y,x> $\notin$ R）$\Leftrightarrow$$\forall$<x,y> （<x,y> $\in$ R $\wedge$<y,x> $\in$ R $\rightarrow$   x$=$y）$\Leftrightarrow$R  $\cap$R^-1^$\subseteq$ I~A~$\Leftrightarrow$无镜像元/无双向箭头

  - 传递关系

    $\forall$<x,y> ，<y,z> （（<x,y> $\in$ R$\wedge$ <y,z> $\in$ R）$\rightarrow$ <x,z> $\in$ R ）$\Leftrightarrow$R$^{\circ}$R$\subseteq$R或M^2^<=M$\Leftrightarrow$直达边（再走一步会到达原点）


------



- 闭包

  - R自反闭包r(R)：（最小性）集合加序偶/对角置1/节点自反箭头   变自反    r(R)=R$\cup$I~A~

  - R对称闭包s(R)：（最小性）集合加序偶/对称置1/节点间双向箭头  变对称   s(R)=R$\cup$R^-1^

  - R传递闭包t(R)：加序偶变传递(多复置1)(多连续直达)   t(R)=R$\cup$R^2^$\cup$R^3^$\cup$….

    > 1. R自复合得到R^2^，判断R^2^包含于R，否则还有未直达序偶，得到R $\cup$ R^2^
    > 2. R^2^复合R得到R^3^，判断R^3^包含于R $\cup$ R^2^，否则还有未直达序偶，得到R $\cup$ R^2^$\cup$ R^3^
    > 3. ….继续复合直到
    > 4. R^n-1^复合R得到R^n^,R^n^ $\subseteq$R $\cup$ R^2^$\cup$ … $\cup$R^n-1^,则t(R)=R $\cup$ R^2^$\cup$ … $\cup$R^n-1^
    >
    > - R^i^其实就说传递i次后到达的位置，若|A|=n，任意点u出发，跑遍其他n-1点最后跨1条边必然会传递到u过；故最多经过n轮（求R^n^）可找到所有传递关系。

    ```c++
    //Warshall算法 -求解传递闭包
    for(j=1;j<=n;j++)
        for(i=1;i<=n;i++)
            if(M[i,j]=1)
                row[i]=row[i] and row[j]
    //将行逐步叠加到**该**列为1的行上
    ```

    > *R^i^代表i条路径形成的路径，也即从某点出发通过i条路径到达的点*
    >
    > *R$\cup$R^2^$\cup$R^3^$\cup$…R^i^，也即从某点出发通过i条路径经过的点*
    >
    > *R^i^ $\subseteq$R $\cup$ R^2^$\cup$ … $\cup$R^i-1^再多走一步并不会有新点产生，即传递已经闭包*

------



- 等价关系—分类

  - 关系的描述：符合自反、对称、传递的定义

  - 序偶：等价类（商集元素A/R）的完全直积

  - 关系矩阵：（行列互换后的）分块全域矩阵

  - 图：分块双向、自反完全图

  - 根据亲密程度划分：

    > ==A的划分==并为A，交为空
    >
    > - **等价关系**由 **对应A** 某个划分 各子集自身直积的并构成，则**该划分**称该关系==等价类==
    >
    > - 其中每个集合都可任取一个元素作为集合的代表，因为他们==等价==
    > - 等价类与划分互相可构造

------



- 偏序关系—比较

  - 关系的描述：符合自反、反对称、可传递的定义
  - 序偶：可比x,y $\in$A，若<x,y> $\in$ $\le$ ，即x$\le$y
    - 全序：$\forall$x,y $\in$ A，x与y可比
  
  
    - 关系矩阵：侧偏矩阵，具有偏向性
  
  
    - 图：化简为哈斯图（不画自旋、直达边、保证向上的单向箭头）
      - 哈斯图同一向上线上的元素均可比
  
    - 偏序集：<元素集合A，偏序关系$\le$>
      - 子集最大元：偏序集<A,R>,B $\subseteq$ A, y~0~ $\in$ B,若$\forall$x $\in$B,<x,y~0~> $\in$R,则y~0~为最大元
        - 子集中均可与之比，且最大的元素
      - 子集最小元：偏序集<A,R>,B $\subseteq$ A, y~0~ $\in$ B,若$\forall$x $\in$B,<y~0~,x> $\in$R,则y~0~为最小元
        - 子集中均可与之比，且最小的元素
      - 子集极大元：偏序集<A,R>,B $\subseteq$ A, y~0~ $\in$ B,若不$\exist$x $\in$B,<y~0~,x> $\in$R,则y~0~为极大元
        - 子集中不会在其他元素之下的元素
      - 子集极小元：偏序集<A,R>,B $\subseteq$ A, y~0~ $\in$ B,若不$\exist$x $\in$B,<x,y~0~> $\in$R,则y~0~为极大元
        - 子集中不会在其他元素之上的元素
      - 上界：偏序集<A,R>，B $\subseteq$ A，y$\in$A，若$\forall$x$\in$B  <x,y> $\in$R，则y是B的上界
        - 在全集中，均可与子集元素比且最大的元素集合
        - 上确界：唯一最小的上界元
      - 上界：偏序集<A,R>，B $\subseteq$ A，y$\in$A，若$\forall$x$\in$B  <y,x> $\in$R，则y是B的下界
        - 在全集中，均可与子集元素比且最小的元素集合
        - 下确界：唯一 最大的下界元
  

------





## 代数系统

用 **领域内运算符**/**有限对象运算表** 定义对应的代数系统

- 广义**加乘**的运算性质【实数、集合、逻辑、矩阵】

  - 封闭（$x\in S,y\in S\Rightarrow x°y\in S$）
  - 交换律（$x°y=y°x$）
  - 结合律（$(x°y)°z=x°(y°z)$
  - 幂等律（$x°x=x$）
  - 分配律（$x*(y°z)=(x*y)°(x*z)$）
  - 吸收律（$x*(x°y)=x$）
  - 单位元（存在则唯一，e=e~L~=e~R~）（如$\empty$、1、0）
    - 左单位元e~L~（$e_L°x=x$）
    - 右单位元e~R~（$x°e_R=x$）
  - 零元（存在则唯一，$\theta$=$\theta$~L~=$\theta$~R~）（如$\empty$、0）
    - 左零元$\theta$~L~（$\theta_L°x=\theta_L$）
    - 右零元$\theta$~R~（$x°\theta_R=\theta_R$）
  - 逆元（存在则唯一，y=y~L~=y~R~）（如$\frac{1}{x}$、-x、X^-1^）
    - 左逆元y~L~（$y_L°x=e$）
    - 右逆元y~R~（$x°y_R=e$）

------



- 代数系统分类

  - 代数系统 <A,°>、<B,*>，$x_1,x_2 \in A$，$ f(x_1),f(x_2) \in B$
    1. 单射：$x_1 \not= x_2$则$f(x_1) \not= f(x_2)$

    2. 满射：$\forall y \in B \exist x \in A 使y=f(x) $

    3. 映射：$f(x_1°x_2)=f(x_1)*f(x_2)$

  > - 满足3为同态，满足2、3为满同态，满足1、3为单同态，满足1、2、3为同构
  >   - **对于同构或同态的代数系统，可以进行性质规律的转移**
  > - 同余关系：代数系统 <A,°>、**等价关系**R来自A $\times$A，若$\forall$ <x1,y1>、<x2,y2> $\in$ R，且<x1°x2，y1°y2> $\in$ R

------



- 代数系统细分

  $$
  代数系统\xrightarrow{封闭(x\in S,y\in S\Rightarrow x°y\in S)}广群\\
  \xrightarrow{结合((x°y)°z=x°(y°z))}半群\\
  \xrightarrow{\exist单位元e(e°x=x°e=x)}幺群/独异点\\
  \xrightarrow{\forall x有逆元\theta(\theta°x=x°\theta=e)}群\\
  \xrightarrow{交换(x°y=y°x)}Abel群/交换群
  $$

  - 元素集有限的群为有限群
  - 半群的封闭子集仍为半群
  - 独异点的运算表任何两行（列）都不相同
  - 若<G,°>为群，则$Abel群\Leftrightarrow \forall a,b \in G (a°b)°(a°b)=(a°a)°(b°b)$

------



- 群<G，°>性质

  1. 群元素集大于1，则群中**没有零元**
  2. 幂次方

  $$
  a^n=\left\{
  \begin{aligned}
  e && n=0 \\
  a^{n-1}°a=a°a^{n-1} &&  n>0 \\
  (a^{-1})^m  && n<0,m=-n
  \end{aligned}
  \right.
  $$

  2. 周期（阶）

  $$
  a^{k_{min}}=e  \\
  \forall a^{k}=e(k_{min}|k) \\
  |a^{-1}|=|a|
  $$

  3. 重要性质

  $$
  \begin{align*}
  & (1)\  \forall a \in G,\ \ \ (a^{-1})^{-1}=a \\
  & (2)\  \forall a,b \in G,(a°b)^{-1}=b^{-1}°a^{-1} \\
  & (3)\  \forall a \in G,\ \ \ a^n°a^m=a^{n+m} \\
  & (4)\  \forall a \in G,\ \ \ (a^n)^m=a^{nm}
  \end{align*}
  $$

  4. 群内有消去律，$\forall a,b,c \in G, a°b=a°c|b°a=c°a \Rightarrow b=c$
  5. 对于$a,b \in G,必存在唯一 x=a^{-1}°b,使得a°x=b$


------



- 子群：$\empty\not=H\subseteq G$，若<H,°>是群则称为<G,°>的子群，H非G则为真子群

  - 判定定理：假设<G,°>是群，$\empty\not=H\subseteq G$
    1. $\forall a,b \in H,a°b \in H,\forall a \in H \rightarrow a^{-1} \in H$【封闭逆元】
    2. $\forall a,b \in H \rightarrow  a°b^{-1} \in H$【混逆封闭】
    3. $|H|有限, \forall a,b \in H \rightarrow  a°b \in H$【有限封闭】

  > - 自身是自身的子群
  > - {e}是一个通用的平凡子群

------



- 循环群：群H  **<a,°>** 的任意元素都有**生成元a**的幂次方得到
  - 任何一个循环群必然是一个Abel交换群
  - 有限循环群G={a^0^=e,a^1^,a^2^,…,a^n-1^}，有生成元x(a的1~n-1中与n互质的整数次方)；无限循环群G={a^0^,a^1^,a^-1^,a^2^,a^-2^,…}，有生成元a和a^-1^
  - $<G,*>是a的循环群，则a^{|G|}=e$

------



- 陪集—等价类：H是G子群，H的右配集$Ha=\{h°a|h\in H,a\in G\}\subseteq G$
  1. 等势，|H|=|Ha|=…
  2. He=H     $\forall a \in G,a\in Ha$

  3. $\forall a,b\ \ a\in Hb \Leftrightarrow ab^{-1}\in H \Leftrightarrow Ha=Hb$==【等价原理】==

  4. $H<=G,R=\{<a,b>|a°b^{-1} \in H\ a,b \in G\} \Rightarrow R为等价关系，[a]_R=Ha$

     - 群—>子群—>等价关系—>等价类

     - $H<=G,(1)\forall a,b \in G,Ha=Hb或Ha\cap Hb=\empty\ (2)\cup Ha_i=G$

  5. 拉格朗日定理：$G为有限群，H<=G， \Rightarrow |G|=|H||G:H|$

     - G元素个数为某个子群个数和陪集数之积

     - 有限群G则$\forall a \in G,阶|a|即|<a>|是|G|的因子，且a^{|G|}=e$

------



- Klein四元群

  | *    | e    | a    | b    | c    |
  | ---- | ---- | ---- | ---- | ---- |
  | e    | e    | a    | b    | c    |
  | a    | a    | e    | c    | b    |
  | b    | b    | c    | e    | a    |
  | c    | c    | b    | a    | e    |

------





## 参考文献

- [hnuysh - 离散数学](https://space.bilibili.com/349030303/video)

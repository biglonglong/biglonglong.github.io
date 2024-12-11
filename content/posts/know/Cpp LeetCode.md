---
title: "Cpp LeetCode"
date: 2024-12-11T23:11:14+08:00
lastmod: 2024-12-11T23:11:14+08:00
author: ["author"]
draft: false

tags: ["tag1", "tag2"]
description: ""
summary: ""

weight:
showToc: true
TocOpen: true
comments: true

cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
    hidden: true
---



date: 2024-12-03
subtitle: 刷 LeetCode 算法题的 Cpp 模板
summary: Cpp算法学习与编程的综合手册，涵盖代码规范、常用工具（如STL容器、宏定义）、动态内存管理、数据结构（如结构体和链表）、以及实用算法模板（排序、二分法、双指针、哈希表等），并附有LeetCode解题技巧和代码示例，适合算法学习、面试准备和竞赛参考。

## 代码规范

1. 变量命名：统一为小驼峰命名法（第一个单词首字母小写，其他单词首字母大写）

   ```cpp
   int myAge;
   ```

2. 代码空格

   - 分隔符后空格;算术表达式紧贴

     ```cpp
     int i, j;
     for(int fastIndex=0; fastIndex<nums.size(); fastIndex++)
     ```

   - 大括号和函数保持同一行，与控制语句（while，if，for）前空格

     ```cpp
     while(n) {
         n--;
     }
     ```



## 常用头

1. 头文件

   | 标准c头文件  | 说明         | 标准c头文件      | 说明             | 标准c头文件     | 说明         |
   | ------------ | ------------ | ---------------- | ---------------- | --------------- | ------------ |
   | assert.h     | 断言相关     | ctype.h          | 字符类型判断     | errno.h         | 标准错误机制 |
   | float.h      | 浮点限制     | limits.h         | 整形限制         | locale.h        | 本地化接口   |
   | math.h/cmath | 数学函数     | setjmp.h         | 非本地跳转       | signal.h        | 信号相关     |
   | stdarg.h     | 可变参数处理 | stddef.h         | 宏和类型定义     | stdio.h/cstdlib | 标准I/O      |
   | stdlib.h     | 标准工具库   | string.h/cstring | 字符串和内存处理 | time.h          | 时间相关     |
   | cstdio       | c标准IO      |                  |                  |                 |              |
   
   | using namespace std; |           |               |               |               |              |
   | -------------------- | --------- | ------------- | ------------- | ------------- | ------------ |
   | **STL头文件**        | **说明**  | **STL头文件** | **说明**      | **STL头文件** | **说明**     |
   | algorithm            | 通用算法  | deque         | 双端队列      | vector        | 向量         |
   | iterator             | 迭代器    | stack         | 栈            | map           | 图（键值对） |
   | list                 | 列表      | string        | 字符串        | set           | 集合         |
   | queue                | 队列      | bitset        | bit类         | numeric       | 数值算法     |
   | iostream             | C++标准IO | bitset        | C++标准位序列 |               |              |
   
2. 宏定义

   ```cpp
   //求最大值和最小值
   #define  MAX(x,y) (((x)>(y)) ? (x) : (y))
   #define  MIN(x,y) (((x) < (y)) ? (x) : (y))
   ```

   ```cpp
   //取余
   #define  mod(x) ((x)%MOD)
   ```
   
   ```cpp
   //for循环
   #define  FOR(i,f_start,f_end) for(int i=f_start;i<=f_end;++i) 
   ```
   
   ```cpp
   //返回数组元素的个数
   #define  ARR_SIZE(a)  (sizeof((a))/sizeof((a[0])))
   ```
   
   ```cpp
   //初始化数组
   #define MT(x,i) memset(x,i,sizeof(x))
   ```
   
   ```cpp
   //符号重定义
   #define LL long long
   #define ull unsigned long long
   #define pii pair<int,int>
   ```
   
   ```cpp
   //常见常数
   #define PI acos(-1.0)
   #define eps 1e-12
   #define INF 0x3f3f3f3f //int最大值
   const int INF_INT = 2147483647;
   const ll INF_LL = 9223372036854775807LL;
   const ull INF_ULL = 18446744073709551615Ull;
   const ll P = 92540646808111039LL;
   const ll maxn = 1e5 + 10, MOD = 1e9 + 7;
   const int Move[4][2] = {-1,0,1,0,0,1,0,-1};
   const int Move_[8][2] = {-1,-1,-1,0,-1,1,0,-1,0,1,1,-1,1,0,1,1};
   ```



## new堆区使用

1. 常规

   ```cpp
   int *x = new int;       		//开辟一个存放整数的存储空间，返回一个指向该空间的地址(即指针)
   int *a = new int(100);  		//开辟一个存放整数的空间，指定初值为100，返回一个指向该空间的地址
   char *b = new char[10]; 		//开辟一个存放字符的10字符大小的数组空间，返回首元素的地址
   ```

2. 固定二维数组

   ```cpp
   const int MAXCOL = 3;			//固定列值
   cin>>row;
   //申请一维数据并将其转成二维数组指针
   int *pp_arr = new int[nRow * MAXCOL];
   int (*p)[MAXCOL] = (int(*)[MAXCOL])pp_arr;
   //此时p[i][j]就可正常使用
   ```

3. 不固定二维数组

   ```cpp
   cin>>row>>col;
   int **p = new int*[row];
   for (int i = 0; i < row; i ++) {
       p[i] = new int[col];
   }
   ```



## 结构体

1. 定义

   ```cpp
   struct InitMember {
       int first;
       double second;
       char* third;
       float four;
   };
   ```

2. 初始化

   ```cpp
   struct InitMember test1 = {-10,3.141590，"method one"，0.25};
   
   struct InitMember test2;
   test2.first = -10;
   test2.second = 3.141590;
   test2.third = "method two";
   test2.four = 0.25;
   ```

3. 构造函数

   ```cpp
   //定义图的定点
   typedef struct Vertex {
       int id,inDegree,outDegree;
       vector<int> connectors;    //存储节点的后续连接顶点编号
       Vertex() : id(-1),inDegree(0),outDegree(0) {}
       Vertex(int nid) : id(nid),inDegree(0),outDegree(0) {}
   } Vertex;
   
   Vertex v(8);
   ```

4. 运算符重载

   ```cpp
   typedef struct node{int id;int h;} node;
   bool operator <(const node& a,const node & b) {return (a.h)<(b.h);}
   ```



## 常用函数

1. atoi()

   ```cpp
   #include <stdlib.h>
   #include <cstring>
   int atoi(const char *str)
   //把参数 str 所指向的字符串转换为一个整数（类型为 int 型）,如果没有执行有效的转换，则返回零
   
   int num = atoi(<string>.c_str());
   ```

2. memset()

   ```cpp
   #include <cstring>
   void *memset(void *str, int c, size_t n)
   //复制字符 c（一个无符号字符）到参数 str 所指向的字符串的前 n 个字符
       
   memset(arr, -1, sizeof(arr));
   memset(arr, 0, sizeof(arr));
   ```

3. to_string()

   ```cpp
   #include<string>
   string to_string (auto num)
   //将数字转换为字符串
       
   string pi=to_string(3.1415926);
   ```



## 常用STL

### container

1. string

```cpp
/*
封装 char* 字符串指针的类，管理 char* 所分配内存，不用考虑内存释放和越界，但内部字符串不以空字符结尾*/

string s											//	生成一个空字符串
s=str,s.assign(str)			     		   			//  赋值
string s(str)										//	生成str复制品s
string s(str,idx)									//	以str始于idx的部分初始化s
string s(str,idx,len)								//	以str始于idx且不超过len长的部分初始化s
string s(cstr)										//	以cstr初始化s
string s(cstr,len)								    //	以cstr前不超过len长的部分初始化s
string s(n,ch)									    //	以n个字符ch初始化s
string s(beg,end)								    //	以由迭代器begin和end指定字符串[begin, end)初始化s

s[i],s.at(i)	             						//  访问下标对应字符元素
s.begin()											//  返回指向首元素的正向迭代器
s.end()												//  返回指向尾元素的下一个位置的正向迭代器
s.rbegin()											//  返回指向尾元素的逆向迭代器
s.rend()											//  返回指向首元素的上一个位置的逆向迭代器

+=,s.append(str),s.push_back(ch)					//	拼接s和str/ch
s.insert(idx,str)									//	在s的idx处插入str
s.erase(idx,len)									//  删除s从idx开始的len个字符
s.replace(idx,len,str)								//	将s从idx开始的len个字符替换为str
s.substr(idx,len)									//	返回s从idx开始的len个字符子串
>、<、>=、<=、==、!=、s.compare(str)  				//	按照字典序比较两个字符串

s.c_str()											//	返回一个指向C字符串的指针常量,指向字符数组以空字符结尾    
s.data()											//	返回一个指向C字符串的指针常量,不以空字符结尾
s.copy(p,len,idx)									//	将s从idx开始的len个字符复制到数组指针p，不以空字符结尾
>>													//	从stream中读取字符串
<<													//	将值写入stream
    
s.size(),s.length()            						//  返回串长
s.capacity()										//	s已分配容量
s.reserve(len)        								//  预分配缓冲空间，使存储空间可容纳len个字符
s.resize(len)										//  扩展字符串，或者截断字符串为len长
s.max_size()										//	string类型结构最多包含的字符数

s.empty()           								//  检查串空
s.clear()											//  删除容器中的所有内容
s.swap(v)           								//  将s与另一个string对象v内容进行交换
```

2. vector

```cpp
/*
顺序结构线性表,支持快速随机访问，在使用过程中动态地增长存储空间,底层数据结构为数组*/

vector<type> v      								//  生成一个type类型空序列
vector<type> v(n,m)  								//  生成一个含有n个type类型元素m的序列
vector<type> v(first,last)，v.assign(first,last)    //  以指定序列[first, last)初始化v
vector<vector<int> >res(m,vector<int>(n,0));        //   生成一个m*n的置0数组
	
v[i]                								//  访问下标对应序列元素
v.front()           								//  返回首元素
v.back()            								//  返回尾元素
v.begin()           								//  返回指向首元素的正向迭代器
v.end()             								//  返回指向尾元素下一位置的正向迭代器

v.push_back(val)      								//  向序列尾插入元素val
v.pop_back()        								//  删除尾元素
v.insert(it,val)   								    //  向迭代器it指向的元素前插入新元素val
v.insert(it,n,val)								    //  向迭代器it指向的元素前插入n个新元素val
v.insert(it,first,last)     						//  向迭代器it指向的元素前插入指定序列[first, last)

v.erase(it)											//  删除迭代器it指向元素
v.erase(first,last)								    //  删除指定序列[first, last)

>、<、>=、<=、==、!=   								//	按照字典序比较两个序列  

v.size()            								//  返回序列长
v.reserve(len)        								//  预分配缓冲空间，使存储空间可容纳len个元素
v.resize(len)										//  扩展序列，或者截断序列为len长
v.resize(len,val)    								//  扩展序列并以val值填充，或者截断序列为len长
    
v.empty()           								//  检查序列空
v.clear()											//  删除容器中的所有内容
v.swap(s)           								//  将v与另一个vector对象s进行交换
```

3. list

```cpp
/*
底层双向链表，支持快速增删*/

list<type> a{n1,n2,n3,...}							// 以type类型元素n1,n2,n3,...初始化链表a
list<type> a(n, m)  								// 生成一个含有n个type类型元素m的序列
list<type> a(first, last)  							// 以指定序列[first, last)初始化v

a.front()           								//  返回首元素
a.back()            								//  返回尾元素
a.begin()           								//  返回指向首元素的随机存取迭代器
a.end()             								//  返回指向尾元素下一位置的随机存取迭代器

a.push_front(val)     								//  向表头插入元素val
a.push_back(val)      								//  向表尾插入元素val
a.insert(it, val)   								//  向迭代器it指向的元素前插入新元素val
a.insert(it, n, val)								//  向迭代器it指向的元素前插入n个新元素val
a.insert(it, first, last)   						//  向迭代器it指向的元素前插入指定序列[first, last)
    
a.pop_back()        								//  删除表尾元素
a.pop_front()       								//  删除表头元素
a.erase(it)         								//  删除由迭代器it所指向的元素
a.erase(first, last)								//  删除指定序列[first, last)
a.remove(x)        	 								//  删除了a中所有值为x的元素

a.size()            								//  返回序列长
a.resize(len)										//  扩展序列，或者截断序列为len长
a.resize(len,val)    								//  扩展序列并以val值填充，或者截断序列为len长
    
a.merge(b)          								//  b变为空，a中包含原a和b的元素
    
a.empty()           								//  检查序列空
a.clear()           								//  删除容器中的所有内容
a.swap(v)           								//  将a与另一个list对象进行交换
```

4. stack

```cpp
/*
底层用list或deque实现，先进后出*/

stack<type> s										//	生成一个type类型空栈	

s.push(val)  										//  入栈
s.pop()    											//  出栈
s.top()    											//  访问栈顶

s.empty()  											//  检查栈空
s.size()  											//  返回栈大小
```

5. queue

```cpp
/*
底层用list或deque实现，先进先出*/

queue<int> q										//	生成一个type类型空队列	

q.push(val)  										//  入队
q.pop()    											//  出队
q.front()  											//  访问队首元素
q.back()   											//  访问队尾元素

q.empty()  											//  检查队空
q.size()	   										//  返回队长
```

6. deque

```cpp
/*
双端队列,中控器控制多个真实数据缓冲区，支持首尾快速增删*/

deque<type> d     									//  生成一个type类型空序列
deque<type> d(n,m)  								//  生成一个含有n个type类型元素m的序列
deque<type> d(first,last)						    //  以指定序列[first, last)初始化d

d.front()           								//  返回首元素
d.back()            								//  返回尾元素
d.begin()											//  返回指向首元素的正向迭代器
d.end()												//  返回指向尾元素的下一个位置的正向迭代器
d.rbegin()											//  返回指向尾元素的逆向迭代器
d.rend()											//  返回指向首元素的上一个位置的逆向迭代器
    
d.push_front(val)     								//  向队列头插入元素val
d.push_back(val)      								//  向队列尾插入元素val
d.emplace_front()     								//  向队列头插入一个元素空间
d.emplace_back()      								//  向队列尾插入一个元素空间
    
d.push_back(val)      								//  向序列尾插入元素val
d.pop_back()        								//  删除尾元素
   
d.insert(it,val)									//在指定位置插入元素 
d.erase(it)											//在指定位置删除元素 
    
d.empty()           								//  检查序列空
d.size()            								//  返回序列长
d.clear()           								//  删除容器中的所有内容
```

7. set

```cpp
/*
set去重,multiset可以存在相同元素,unordered_set查询更快*/

set<type> s											//	生成一个type类型空集合
multiset<type> s									//	生成一个type类型空可重集合
unordered_set<type> s(first,last)     				//	以指定序列[first, last)初始化s

s.begin()       									//  返回指向首元素的正向迭代器
s.end()         									//  返回指向尾元素的下一个位置的正向迭代器
s.rbegin()											//  返回指向尾元素的逆向迭代器
s.rend()											//  返回指向首元素的上一个位置的逆向迭代器

s.insert(val)      									//  插入元素val
s.erase(val)       									//  删除集合s中元素val
s.find(val)        									//  返回一个指向被查元素val的迭代器,无则返回s.end()

s.size()        									//  返回集合长
s.count(val)       									//  返回集合中val的个数

s.empty()      										//  检查集合空
s.clear()											//  删除容器中的所有内容
s.swap(v)											//  将s与另一个set对象v进行交换
    
s.max_size()    									//  返回set类型对象能容纳的元素的最大限值
s.get_allocator()   								//  返回集合s的分配器
s.equal_range(val) 									//  返回集合s中与给定值val相等的上下限迭代器
s.lower_bound() 									//  返回指向第一个大于或等于指定键的元素迭代器
s.upper_bound() 									//  返回指向第一个大于指定键的元素迭代器
s.key_comp()    									//  用于比较两个键的大小关系，它返回一个用于键比较的函数对象
s.value_comp()  									//  用于比较两个值的大小关系，它返回一个用于值比较的函数对象
```

8. pair

```cpp
/*
#include <utility>,pair二元组或元素对*/

pair<type1,type2> p          						//	生成一个<type1,type2>类型空二元组
p.first												//	定义/返回二元组p的第一个元素
p.second											//	定义/返回二元组p的第二个元素
make_pair(val1,val2)								//  以val1为键,val2为值初始化p
    
<、>、<=、>=、==、!=								 	//  按照字典序比较，先比较first，first相等时再比较second
```

9. map

```cpp
/*
存储pair序列,所有元素的Key值必须是唯一的,multiset可以存在相同键值,unordered_map查询更快*/
map<type1,type2> m								//	生成一个<type1,type2>类型空字典

m[key] = value									//  修改/插入pair<key,value>，返回m[key]的value值
m.insert(make_pair(key,value)) 					//  插入pair<key,value>，insert操作会返回一个pair,当map中没有与key相匹配的键值时,其first是指向插入元素对的迭代器,其second为true;若map中已经存在与key相等的键值时,其first是指向该元素对的迭代器,second为false

int value = m[key]              				//  查找字典中键为key的value值，无则创建m[key]=0且返回0
it = m.find(key)			    				//  查找字典中键为key对应迭代器，无则返回m.end()

m.erase(key)									//  删除指定key键值相匹配的元素对,并返回被删除的元素的个数
m.erase(it)										//  删除由迭代器it所指定的元素对,并返回指向下一个元素对的迭代器
    
m.size();       								//  返回字典长
m.empty();      								//  检查字典空
m.clear();      								//  删除容器中的所有内容
```

10. bitset

```cpp
const int MAXN = 32;
bitset<MAXN> bt;            //  bt 包括 MAXN 位，下标 0 ~ MAXN - 1，默认初始化为 0
bitset<MAXN> bt1(0xf);      //  0xf 表示十六进制数 f，对应二进制 1111，将 bt1 低 4 位初始化为 1
bitset<MAXN> bt2(012);      //  012 表示八进制数 12，对应二进制 1010，即将 bt2 低 4 位初始化为 1010
bitset<MAXN> bt3("1010");   //  将 bt3 低 4 位初始化为 1010
bitset<MAXN> bt4(s, pos, n);//  将 01 字符串 s 的 pos 位开始的 n 位初始化 bt4

bt.any()        //  bt 中是否存在置为 1 的二进制位？
bt.none()       //  bt 中不存在置为 1 的二进制位吗？
bt.count()      //  bt 中置为 1 的二进制位的个数
bt.size()       //  bt 中二进制位的个数
bt[pos]         //  访问 bt 中在 pos 处的二进制位
bt.test(pos)    //  bt 中在 pos 处的二进制位是否为 1
bt.set()        //  把 bt 中所有二进制位都置为 1
bt.set(pos)     //  把 bt 中在 pos 处的二进制位置为 1
bt.reset()      //  把 bt 中所有二进制位都置为 0
bt.reset(pos)   //  把 bt 中在pos处的二进制位置为0
bt.flip()       //  把 bt 中所有二进制位逐位取反
bt.flip(pos)    //  把 bt 中在 pos 处的二进制位取反
bt[pos].flip()  //  同上
bt.to_ulong()   //  用 bt 中同样的二进制位返回一个 unsigned long 值
os << bt        //  把 bt 中的位集输出到 os 流
```

### algorithm

| 不修改内容的序列函数              | 说明                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| adjacent_find                     | 查找两个相邻（Adjacent）的等价（Identical）元素              |
| all_ofC++11                       | 检测在给定范围中是否所有元素都满足给定的条件                 |
| any_ofC++11                       | 检测在给定范围中是否存在元素满足给定条件                     |
| count                             | 返回值等价于给定值的元素的个数                               |
| count_if                          | 返回值满足给定条件的元素的个数                               |
| equal                             | 返回两个范围是否相等                                         |
| find                              | 返回第一个值等价于给定值的元素                               |
| find_end                          | 查找范围*A*中与范围*B*等价的子范围最后出现的位置             |
| find_first_of                     | 查找范围*A*中第一个与范围*B*中任一元素等价的元素的位置       |
| find_if                           | 返回第一个值满足给定条件的元素                               |
| find_if_notC++11                  | 返回第一个值不满足给定条件的元素                             |
| for_each                          | 对范围中的每个元素调用指定函数                               |
| mismatch                          | 返回两个范围中第一个元素不等价的位置                         |
| none_ofC++11                      | 检测在给定范围中是否不存在元素满足给定的条件                 |
| search                            | 在范围*A*中查找第一个与范围*B*等价的子范围的位置             |
| search_n                          | 在给定范围中查找第一个连续*n*个元素都等价于给定值的子范围的位置 |
| **accumulate(first, last, init)** | 以init为初值计算指定序列[first, last)的累加和                |

| 修改内容的序列操作函数               | 说明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| copy                                 | 将一个范围中的元素拷贝到新的位置处                           |
| copy_backward                        | 将一个范围中的元素按逆序拷贝到新的位置处                     |
| copy_ifC++11                         | 将一个范围中满足给定条件的元素拷贝到新的位置处               |
| copy_nC++11                          | 拷贝 n 个元素到新的位置处                                    |
| fill                                 | 将一个范围的元素赋值为给定值                                 |
| fill_n                               | 将某个位置开始的 n 个元素赋值为给定值                        |
| generate                             | 将一个函数的执行结果保存到指定范围的元素中，用于批量赋值范围中的元素 |
| generate_n                           | 将一个函数的执行结果保存到指定位置开始的 n 个元素中          |
| iter_swap                            | 交换两个迭代器（Iterator）指向的元素                         |
| moveC++11                            | 将一个范围中的元素移动到新的位置处                           |
| move_backwardC++11                   | 将一个范围中的元素按逆序移动到新的位置处                     |
| random_shuffle                       | 随机打乱指定范围中的元素的位置                               |
| remove                               | 将一个范围中值等价于给定值的元素删除                         |
| remove_if                            | 将一个范围中值满足给定条件的元素删除                         |
| remove_copy                          | 拷贝一个范围的元素，将其中值等价于给定值的元素删除           |
| remove_copy_if                       | 拷贝一个范围的元素，将其中值满足给定条件的元素删除           |
| replace                              | 将一个范围中值等价于给定值的元素赋值为新的值                 |
| replace_copy                         | 拷贝一个范围的元素，将其中值等价于给定值的元素赋值为新的值   |
| replace_copy_if                      | 拷贝一个范围的元素，将其中值满足给定条件的元素赋值为新的值   |
| replace_if                           | 将一个范围中值满足给定条件的元素赋值为新的值                 |
| **reverse(first, last)**             | 反转指定序列[first, last)                                    |
| **reverse_copy(first, last, begin)** | 将指定序列[first, last)对应反转序列，拷贝到以begin开始的序列内 |
| rotate                               | 循环移动指定范围中的元素                                     |
| rotate_copy                          | 拷贝指定范围的循环移动结果                                   |
| shuffleC++11                         | 用指定的随机数引擎随机打乱指定范围中的元素的位置             |
| swap                                 | 交换两个对象的值                                             |
| swap_ranges                          | 交换两个范围的元素                                           |
| transform                            | 对指定范围中的每个元素调用某个函数以改变元素的值             |
| unique                               | 删除指定范围中的所有连续重复元素，仅仅留下每组等值元素中的第一个元素。 |
| unique_copy                          | 拷贝指定范围的唯一化（参考上述的 unique）结果                |

| 划分函数             | 说明                                          |
| -------------------- | --------------------------------------------- |
| is_partitionedC++11  | 检测某个范围是否按指定谓词（Predicate）划分过 |
| partition            | 将某个范围划分为两组                          |
| partition_copyC++11  | 拷贝指定范围的划分结果                        |
| partition_pointC++11 | 返回被划分范围的划分点                        |
| stable_partition     | 稳定划分，两组元素各维持相对顺序              |

| 排序函数                  | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| is_sortedC++11            | 检测指定范围是否已排序                                       |
| is_sorted_untilC++11      | 返回最大已排序子范围                                         |
| nth_element               | 部份排序指定范围中的元素，使得范围按给定位置处的元素划分     |
| partial_sort              | 部份排序                                                     |
| partial_sort_copy         | 拷贝部分排序的结果                                           |
| **sort(begin, end, cmp)** | 将序列[begin, end)以cmp的方式排序，cmp返回为序列元素间比较提供布尔值 |
| stable_sort               | 稳定排序                                                     |


| 二分法查找函数 | 说明                                                 |
| -------------- | ---------------------------------------------------- |
| binary_search  | 判断范围中是否存在值等价于给定值的元素               |
| equal_range    | 返回范围中值等于给定值的元素组成的子范围             |
| lower_bound    | 返回指向范围中第一个值大于或等于给定值的元素的迭代器 |
| upper_bound    | 返回指向范围中第一个值大于给定值的元素的迭代器       |

| 集合操作函数             | 说明                               |
| ------------------------ | ---------------------------------- |
| includes                 | 判断一个集合是否是另一个集合的子集 |
| inplace_merge            | 就绪合并                           |
| merge                    | 合并                               |
| set_difference           | 获得两个集合的差集                 |
| set_intersection         | 获得两个集合的交集                 |
| set_symmetric_difference | 获得两个集合的对称差               |
| set_union                | 获得两个集合的并集                 |

| 堆操作函数         | 说明                                 |
| ------------------ | ------------------------------------ |
| is_heap            | 检测给定范围是否满足堆结构           |
| is_heap_untilC++11 | 检测给定范围中满足堆结构的最大子范围 |
| make_heap          | 用给定范围构造出一个堆               |
| pop_heap           | 从一个堆中删除最大的元素             |
| push_heap          | 向堆中增加一个元素                   |
| sort_heap          | 将满足堆结构的范围排序               |

| 最大/最小操作函数       | 说明                                           |
| ----------------------- | ---------------------------------------------- |
| is_permutationC++11     | 判断一个序列是否是另一个序列的一种排序         |
| lexicographical_compare | 比较两个序列的字典序                           |
| max                     | 返回两个元素中值最大的元素                     |
| max_element             | 返回给定范围中值最大的元素                     |
| min                     | 返回两个元素中值最小的元素                     |
| min_element             | 返回给定范围中值最小的元素                     |
| minmaxC++11             | 返回两个元素中值最大及最小的元素               |
| minmax_elementC++11     | 返回给定范围中值最大及最小的元素               |
| next_permutation        | 返回给定范围中的元素组成的下一个按字典序的排列 |
| prev_permutation        | 返回给定范围中的元素组成的上一个按字典序的排列 |



## 编程模板

### 变化多端的模拟技法

- 排列的特性 - [下一个排列](https://leetcode.cn/problems/next-permutation/)



### 排序

1. bubble_sort

```cpp
//逐个冒出当前最大值
template <class T>
void bubble_sort(T arr[],int len){
    for(int i=0;i<len-1;i++){
        for(int j=0;j<len-i-1;j++)
            if(arr[j]>arr[j+1])
                swap(arr[j],arr[j+1]);
    }
}
//设置flag，如果存在一轮冒泡没有进行交换，则排序完成
```

2. selection sort

```cpp
//从序列中选出该位置上应该出现的元素
template <class T>
void selection_sort(T arr[],int len){
    for(int i=0;i<len-1;i++){
        int index=i;
        for(int j=i+1;j<len;j++){
            if(arr[j]<arr[index]){
                index=j;
            }
        }
        swap(arr[i],arr[index]);
    }
```

3. direct_insert_sort

```cpp
//向前遍历有序序列，寻找当前元素的合适位置插入
template <class T>
void  direct_insertion_sort(T arr[],int len){
    for(int i=1;i<len;i++){
        T key=arr[i];
        int j=i;
        while(j-1>=0&&arr[j-1]>key){
            arr[j]=arr[j-1];
            j--;
        }
        arr[j]=key;
    }//位置j的元素要么是j-1(挪),要么是key(插)
}
//二分法加快插入位置的搜索
```

4. shell _sort

```cpp
//宏观性优先调控，减少插排比较和交换次数
template <class T>
void shell_sort(T arr[],int len){
    int h=1;
    while(h<len/3) h=3*h+1;
    while(h>=1){
        for(int i=h;i<len;i++){
            T key=arr[i];
            int j=i;
            while(j-h>=0&&key<arr[j-h]){
                arr[j]=arr[j-h];
                j-=h;
            }
            arr[j]=key;
        }
        h/=3;
    }
}
//对于增量以除以2递减的排序，时间代价：$\theta$(n^2^);选取的增量之间并不互质，上一轮排序中某些子序列已经排过了导致处理效率不高
//对于增量不以除以2递减的排序，时间代价：$\theta$(n^3/2^)
```

5. qsort

```cpp
/*1.选择轴值

2.划分两个子序列L和R

- 使得L中所有记录都小于或者等于轴值
- R中记录大于轴值
*/

//采用双指针排列小序列，也可以使用夹逼的方式
int partitioner(int arr[],int low,int high){
    int pivot=arr[high];
    int i=low;
    for(int j=low;j<high;j++)//处理low~high-1的元素pivot分离
        if(arr[j]<pivot)
            swap(arr[i++],arr[j]);
    swap(arr[i],arr[high]); //对小于pivot的最后一个元素的后一位置与pivot交换（包括边界）
    return i;
}

void qsort(int arr[],int low,int high){
    if(low<high){
        int mid=partitioner(arr,low,high);
        qsort(arr,low,mid-1);
        qsort(arr,mid+1,high);
    }
}
```

```cpp
inline int findpivot(int* arr,int i ,int j){
    return (i+j)/2;
}

inline int Partition(int* arr,int left,int right,int pivotindex){
    swap(arr[pivotindex],arr[right]);
    int pivot = arr[right];
    int i = left-1, j=right;
    do{
        while(arr[++i] < pivot);       
        while((i < j) && (pivot < arr[--j]));    
        swap(arr[i], arr[j]);
    }while(i<j);
    swap(A[i],A[right]);
    return i;
}

inline int Partition(int* arr,int left,int right,int pivotindex){
    swap(arr[pivotindex],arr[left]);
    int pivot = arr[left];
    int i = left,j=right+1;
    while(ture){
        while(arr[++i]<=pivot && i<right);
        while(arr[--j]>=pivot && j>left+1);
        if(i<j) swap(arr[i],arr[j]);
        else break;
    }
    swap(arr[j],arr[left]);
    return j;
}

//交换循环中要求对i,j索引有边界限制和qsort交换限制
//交换要求i<j
//mid与pivot位置有关，pivot放在右边，则为i（第一个大于pivot的index）；否则为j

void qsort(int *arr,int left,int right){
    if(left<right){
        int pivotindex = findpivot(arr,left,right);
        int mid=Partition(A,left,right,pivotindex);
        qsort(A,left,mid-1);
        qsort(A,mid+1,right);
    }
}
```

6. merge_sort

```cpp
void merger(int arr[],int temparr[],int left,int mid,int right){
    int l_pos=left;
    int r_pos=mid+1;
    int pos=left;
    while(l_pos<=mid&&r_pos<=right)
    {
        if(arr[l_pos]<arr[r_pos])
            temparr[pos++]=arr[l_pos++];
        else
            temparr[pos++]=arr[r_pos++];
    }
    while(l_pos<=mid)
    {
        temparr[pos++]=arr[l_pos++];
    }
    while(r_pos<=right)
    {
        temparr[pos++]=arr[r_pos++];
    }
    while(left<=right)
    {
        arr[left]=temparr[left];
        left++;
    }
}

void merge_sort(int arr[],int temparr[],int left,int right)
{
    if(left<right){
        int mid=(left+right)/2;
        merge_sort(arr,temparr,left,mid);
        merge_sort(arr,temparr,mid+1,right);
        merger(arr,temparr,left,mid,right);
    }
}
```



### 二分法

> 原理：针对`sortedArr`，目标位于`[left,right]`之间，对`middle`搜索，`right+1=left`时终止。
>
> 变化：对`nums[middle]==target`及`return`情况讨论

1. 无重复插入

```cpp
int binarySearch(vector<int>& nums, int target) {
    int middle,left=0,right=nums.size()-1;
    while(left<=right){
        middle = left+(right-left)/2;
        if(nums[middle]<target) left=middle+1 ;   
        else if(nums[middle]>target) right=middle-1;
        else return middle;
    }
    return left/return right+1;
}
```

2. 区间查找

```cpp
int findLeft(vector<int>& nums, int target) {
    int middle, left=0, right=nums.size()-1, ans=-1;
    while(left<=right) {
        middle=left+(right-left)/2;
        if(nums[middle]<target) left=middle+1 ;   
        else if(nums[middle]>target) right=middle-1;
        else {
            right=middle-1;
            ans=middle;
        }
    }
    if(ans!=-1 && nums[ans]==target) return ans;
    return -1;
}
int findRight(vector<int>& nums, int target) {
    int middle, left=0, right=nums.size()-1, ans=-1;
    while(left<=right) {
        middle=left+(right-left)/2;
        if(nums[middle]<target) left=middle+1 ;   
        else if(nums[middle]>target) right=middle-1;
        else {
            left=middle+1;
            ans=middle;
        }
    }
    if(ans!=-1 && nums[ans]==target) return ans;
    return -1;
}
vector<int> searchRange(vector<int>& nums, int target) {
    return {findLeft(nums, target), findRight(nums, target)};
}
```



### 双指针

> 快慢指针：
>
> - 原理：利用`fast`遍历序列，利用`nums[slow++]`处理`fast`元素
> - 变化：对`condition(nums[fast])`和`action(slow++,fast)`讨论
>
> 双头指针：
>
> - 原理：针对`compare(nums[left],nums[right])`，用当前`left++`元素或`right- -`元素对`res`补充
> - 变化：对`compare(nums[left],nums[right])`和`res`的补充讨论
>
> 滑动窗口：
>
> - 原理：用`end`遍历序列，当窗口[start,end]合法时，再`start++`优化窗口，不合法后继续遍历
> - 变化：对`checkLegal([start,end],target)`和合法`deal(res, [start,end])`讨论

1. 快慢指针

```cpp
int slowFast(vector<int>& nums, int val) {
    int slow=0;
    for(int fast=0;fast<nums.size();fast++){
        if(condition(nums[fast]))
            action(slow++,fast);
    }
    return slow;
}
```

2. 合并指针

```cpp
void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int p1 = 0, p2 = 0;
    int sorted[m + n];
    while (p1 < m || p2 < n) {
        if(p1==m) sorted[p1+p2-1]=nums2[p2++];
        else if(p2==n) sorted[p1+p2-1]=nums1[p1++];
        else if(nums1[p1]<nums2[p2]) sorted[p1+p2-1]=nums1[p1++];
        else sorted[p1+p2-1]=nums2[p2++];
    }
}
```

3. 双头指针

```cpp
int leftRight(vector<int>& nums){
    int left=0,right=nums.size()-1;
    while(left<=right){
        if(compare(left,right)) 
            res.push_back(nums[left++]||nums[right--]);
    }
}
```

4. 滑动窗口

```cpp
int startEnd(int target, vector<int>& nums) {
    int start=0;
    for(int end=0;end<nums.size();end++){
        push(nums[end]);
        while(checkLegal([start,end],target)) {
            	deal(res, [start,end]);
            	start++;
        }
    }
    return res;
}
```

5. 四数之和-组合去重

```cpp
//需要排序，返回值不可是索引，可去重
vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());      		
    vector<vector<int>> res;
    for(int i=0; i<nums.size(); i++) {
        if(i>0 && nums[i]==nums[i-1]) continue;		//a去重
        for(int j=i+1; j<nums.size(); j++) {
            if(j>i+1 && nums[j]==nums[j-1]) continue;		//b去重
            int left=j+1,right=nums.size()-1;
            while(left<right) {
                long val = (long)nums[i]+nums[j]+nums[left]+nums[right];
                if(val>target) right--;
                else if(val<target) left++;
                else {
                    while(right-1>left && nums[right]==nums[right-1]) right--;
                    while(right>left+1 && nums[left]==nums[left+1]) left++;			//c、d去重
                    res.push_back({nums[i], nums[j], nums[left], nums[right]});
                    right--;left++;
                }
            }
        } 
    }
    return res;
}
```

6. 螺旋矩阵

```cpp
vector<vector<int>> generateMatrix(int n) {
    vector<vector<int>> res(n,vector<int>(n,0));
    int x1=0,y1=0,x2=n-1,y2=n-1;					//不变量：螺旋角标
    int num=1;
    while(x1<x2&&y1<y2){
        for(int i=y1;i<y2;i++) res[x1][i]=num++;
        for(int i=x1;i<x2;i++) res[i][y2]=num++;
        for(int i=y2;i>y1;i--) res[x2][i]=num++;
        for(int i=x2;i>x1;i--) res[i][y1]=num++;
        x1++;y1++;x2--;y2--;
    }
    if(x1==x2)										//奇偶性补充
        for(int i=y1;i<=y2;i++) res[x1][i]=num++;
    else if(y1==y2)
        for(int i=x1;i<=x2;i++) res[i][y1]=num++;
    return res;
}
```



### 哈希表

>  | 集合               | 底层实现   | 是否有序 | 数值是否可以重复 | 能否更改数值 | 查询效率 | 增删效率 |
>  | ------------------ | ---------- | -------- | ---------------- | ------------ | -------- | -------- |
>  | std::set           | 红黑树     | **有序** | 否               | 否           | O(log n) | O(log n) |
>  | std::multiset      | 红黑树     | 有序     | **是**           | 否           | O(logn)  | O(logn)  |
>  | std::unordered_set | **哈希表** | 无序     | 否               | 否           | O(1)     | O(1)     |
>
>  | ==映射==           | 底层实现   | 是否有序    | 数值是否可以重复 | 能否更改数值 | 查询效率 | 增删效率 |
>  | ------------------ | ---------- | ----------- | ---------------- | ------------ | -------- | -------- |
>  | std::map           | 红黑树     | **key有序** | key不可重复      | key不可修改  | O(logn)  | O(logn)  |
>  | std::multimap      | 红黑树     | key有序     | **key可重复**    | key不可修改  | O(log n) | O(log n) |
>  | std::unordered_map | **哈希表** | key无序     | key不可重复      | key不可修改  | O(1)     | O(1)     |

> 原理：利用哈希结构，快速**判断一个元素是否出现过**，降低搜索的时间复杂度
>
> 变化：紧凑数据用`arr`，分散数据用`set`，对应关系用`map`

1. 四数相加II

```cpp
//不作排序，返回索引，无需去重
int fourSumCount(vector<int>& A, vector<int>& B, vector<int>& C, vector<int>& D, int target) {
    unordered_map<int, int> umap; 								//a+b:count(a+b)
    for (int a : A) 
        for (int b : B) 
            umap[a + b]++;
    
    int count = 0;
    for (int c : C) {
        for (int d : D) {
            if (umap.find(target-(c+d))!=umap.end()) {
                count+=umap[target-(c+d)];
            }
        }
    }
    return count;
}
```

2. 三数之和-组合去重

```cpp
//需要排序，返回数值，可去重
vector<vector<int>> threeSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    for(int i=0; i<nums.size(); i++) {
        if(i>0 && nums[i]==nums[i-1]) continue;		//a去重
        unordered_set<int> s;
        for(int j=i+1; j<nums.size(); j++) {
            if(j>i+2 && nums[j]==nums[j-1]  && nums[j-1]==nums[j-2]) continue;		//b去重
            //if(j>i+1 && nums[j]==nums[j-1]) continue会导致跳过b、c共用同一元素的情况
            int c=target-(nums[i]+nums[j]);
            if(s.find(c)!=s.end()) {
                res.push_back({nums[i],nums[j],c});
                s.erase(c);		//c去重
            }
            else s.insert(nums[j]);
        }
    }
    return res;
}
```

3. 标记数组/矩阵置零

```cpp
void setZeroes(vector<vector<int>>& matrix) {
    int m=matrix.size(), n=matrix[0].size();
    vector<bool> row(m, false);
    vector<bool> col(n, false);
    for(int i=0; i<m; i++) {
        for(int j=0; j<n; j++) {
            if(matrix[i][j]==0) {
                row[i]=col[j]=true;
            }
        }
    } 
    for(int i=0; i<m; i++) {
        for(int j=0; j<n; j++) {
            if(row[i] || col[j]) {
                matrix[i][j]=0;
            }
        }
    }

    return;
}
```



### 前缀和

> 原理：优先累加好下标i之前序列，避免重复计算
>
> 变化：多维累加需先累加降维

1. 区间和

```cpp
int rangeSum(vector<int>& vec, int i, int j) {
    for(int i=0; i<vec.size(); i++) vec[i]+=vec[i-1];
    if(i==0) return vec[j];
    else return vec[j]-vec[i-1];
}  
```



### 链表

> 原理：内存管理更为灵活的线性结构
>
> 变化：设置虚拟头节点`dummyHead`保证代码统一；`while`循环检`NULL`防止越界

1. 定义

```cpp
struct ListNode {
    int val;
    ListNode *next;
    ListNode():val(0), next(nullptr) {}
    ListNode(int x): val(x), next(nullptr) {}
    ListNode(int x, ListNode *next):val(x), next(next) {}
};
ListNode* _dummyHead= new ListNode(0,head);
ListNode* head = _dummyHead->next;
```

2. 平分链表

```cpp
vector<ListNode*> equalList(ListNode* head) {
    if(head==NULL || head->next==NULL) return {head,NULL};
    ListNode* slow=head;
    ListNode* fast=head;
    ListNode* pre=head;
    while(fast!=NULL && fast->next!=NULL) {
        pre=slow;
        slow=slow->next;
        fast=fast->next->next;
    }
    pre->next=NULL;
    if(fast==NULL) return {head, slow};			//偶数，自然平分
    else return {head, slow->next};   			//奇数，删除中间节点
}
```

3. 反转链表

```cpp
ListNode* reverseList(ListNode* head) {
    ListNode *tmp;
    ListNode *cur=head;
    ListNode *pre=NULL;
    while(cur!=NULL){							//逐个操作链表节点
        tmp=cur->next;
        cur->next=pre;
        pre=curr;
        cur=tmp;
    }
    return pre;
}
------------------------------------------------------------------------------
ListNode* reverseList(ListNode* head) {
    if(head==NULL || head->next==NULL) return head;
    ListNode *last=reverseList(head->next);
    head->next->next=head;
    head->next=NULL;
    return last;
}
```

4. 环入口

```cpp
ListNode *detectCycle(ListNode *head) {			//slow:x+y   fast:x+y+n*(y+z)  -->   x=n(y+z)+z
    ListNode* slow=head;
    ListNode* fast=head;
    while(fast!=NULL && fast->next!=NULL) {		//间隔操作链表节点
        slow=slow->next;
        fast=fast->next->next;
        if(slow==fast) {
            ListNode* meet=slow;
            ListNode* entry=head;
            while(meet!=entry) {
                meet=meet->next;
                entry=entry->next;
            }
            return entry;
        }
    }
    return NULL;
}
```



### 字符串

> - string：字符数组`char[]`的封装类，包含对字符数组的一系列操作，`c_str()`、`data()`可查
> - C风格字符串，‘\0’结尾，以对应首字符地址呈现，cout打印时直到‘\0’结束
>   - char*： 字符指针，指向内存中某字符串位置
>   - char[]：字符数组，在栈区，可重复，指针常量性质，作为形参时统一作char*处理。
>   - “string”：字符串常量，在常量区，具有唯一性

1. 字符串反转

```cpp
void reverse(vector<char>& s,int start,int end){
    for(int i=start;i<=(start+end)/2;i++){
        swap(s[i],s[end+start-i]);
    }
}
----------------swap--------------------------------
int temp = s[i];
s[i] = s[j];
s[j] = temp;

a[i] = a[i] ^ a[j]; 
a[j] = a[i] ^ a[j]; // a[j] = a[i] ^ a[j] ^ a[j] = a[i]
a[i] = a[i] ^ a[j]; // a[i] = a[i] ^ a[j] ^ a[i] = a[j]

a[i] = a[i] + a[j];
a[j] = a[i] - a[j]; // a[j] = a[i] + a[j] - a[j]
a[i] = a[i] - a[j]; // a[i] = a[i] + a[j] - a[i]
```

2. 匹配

   - 朴素模式匹配

     ```cpp
     int i=0, j=0, m=text.size(),n=model.size();
     while(i+n<=m) {
         while(text[i+j]==model[j]) {
             j++;
             if(j==n) return i;								//else return i;
         }
         i++;												//if(model.compare(m.substr(i,n))!=0) ++i;
         j=0;
     }
     return -1;
     ```

   - Sunday匹配

     ```cpp
     int i=0, j=0, m=text.size(), n=model.size();
      
     # define MAXCH 256
     int* offset=new int[MAXCH];
     for(int k=0; k<MAXCH; k++) {
         offset[k]=n+1;					//当当前匹配text子串下一字符不在model中，自动移动到text子串下下一字符匹配
     }
     for(int k=0; k<n; k++) {
         offset[model[k]]=n-k;			//当当前匹配text子串下一字符在model中，对齐该字符进行匹配
     }
     
     while(i+n<=m) {
         while(text[i+j]==model[j]) {	//对当前text子串进行匹配
             j++;
             if(j==n) return i;
         }
         i+=offset[text[i+n]];			//当前text子串不匹配时，根据下一字符进行起始i挪移，并重新匹配新zi'chuan
         j=0;
     }
     return -1;
     ```

   - KMP

     ```cpp
     void getNext(int* next, const string& s) {
         int j=0;							
         next[0]=0;									
         for(int i=1; i<s.size(); i++) {		//j代表前缀下一字符，i代表后缀下一字符，j也代表最长前后缀长度
             while (j>0 && s[i]!=s[j]) {		
                 j=next[j-1];				//不断用前缀代替后缀，直到前后缀下一字符相等，或者匹配第一个字符
             }
             if(s[i]==s[j]) j++;				//前后缀下一字符相等，最长前后缀的长度加一，或者匹配第一个字符
             next[i]=j;						//赋值最长前后缀长度
         }
     }
     int strStr(string text, string model) {
         if (model.size()==0) return 0;
         vector<int> next(model.size());
         getNext(&next[0], model);
         int j = 0;
         for (int i = 0; i < text.size(); i++) {
             while(j>0 && text[i]!=model[j]) {					
                 j=next[j-1];							//不断用前缀代替后缀，匹配当前字符最长匹配，或者匹配第一个字符
             }
             if (text[i]==model[j]) j++;							//匹配model下一字符
             if (j==model.size()) return i-model.size()+1;		//匹配完model所有字符则返回
         }
         return -1;
     }
     ```



### 栈

> 一般栈：
>
> - 原理：记录已经遍历过的元素，方便随时按逆序取回或查看上一操作
> - 变化：插入和弹出的时机；确定`!st.empty()`再`st.pop()`或者`st.top()`
>
> 单调栈：
>
> - 原理：单调入栈，不单调连续弹出
> - 变化：寻找任一个元素的右边或者左边第一个比自己大或者小的元素的位置；栈外栈口栈内形成拐点，对于单增栈，栈内外是`top()`左右边第一个变大元素

1. 栈to队列

```cpp
class MyQueue {
public:
    MyQueue() {}
    
    void push(int x) {
        stIn.push(x);
    }
    
    int pop() {
        if(stOut.empty()) {
            while(!stIn.empty()) {
                stOut.push(stIn.top());
                stIn.pop();
            }
        }
        int res=stOut.top();
        stOut.pop();
        return res;
    }
    
    int peek() {
        int res=this->pop();
        stOut.push(res);
        return res;
    }
    
    bool empty() {
        return stIn.empty() && stOut.empty();
    }
private:
    stack<int> stIn;
    stack<int> stOut;
};
```

2. 计算器

```cpp
int precedence(char op) {
    if((op=='(') return 0;
    else if(op=='+' || op=='-') return 1;
    else if(op=='*' || op=='/') return 2;
    else if (op=='^') return 3;
    else return -1;
}

//中缀 --> 后缀：将中缀按运算顺序加上括号，再将操作符移动到对应括号后，最后删除括号
string infixToPostfix(const string& expression) {
    string postfix="";
    stack<char> st;

    for (int i=0; i<expression.size(); i++) {
        if(expression[i]==' ') continue;
        else if(isalnum(expression[i])) postfix+=expression[i];
        else if(expression[i]=='(') st.push(expression[i]);
        else if (expression[i]==')') {
            while (!st.empty() && st.top()!='(') {
                postfix+=st.top();
                st.pop();
            }
            if(!st.empty()) st.pop();
        }
        else {
            while(!st.empty() && precedence(st.top())>=precedence(expression[i])) {	
                postfix+=st.top();				//当新操作符优先级较低时，处理好前面优先级低的算式
                st.pop();
            }
            st.push(expression[i]);
        }
    }
    while(!st.empty()) {
        postfix+=st.top();
        st.pop();
    }
    return postfix;
}

//中缀 --> 前缀：将中缀按运算顺序加上括号，再将操作符移动到对应括号前，最后删除括号
string infixToPrefix(const string& expression) {
    string prefix="";
    stack<char> st;

    for (int i=expression.size()-1; i>=0; i--) {
        if(expression[i]==' ') continue;
        else if(isalnum(expression[i])) prefix+=expression[i];
        else if(expression[i]==')') st.push(expression[i]);
        else if (expression[i]=='(') {
            while (!st.empty() && st.top()!=')') {
                prefix+=st.top();
                st.pop();
            }
            if(!st.empty()) st.pop();
        }
        else {
            while(!st.empty() && precedence(st.top())>precedence(expression[i])) {
                prefix+=st.top();
                st.pop();
            }
            st.push(expression[i]);
        }
    }
    while(!st.empty()) {
        prefix+=st.top();
        st.pop();
    }
    reverse(prefix.begin(), prefix.end());
    return prefix;
}

// 后缀 --> 中缀：顺序遍历，遇到操作数直接压入栈中，遇到操作符弹出两操作数组成新的表达式并压入栈
string postfixToInfix(string expression) {
    stack<string> st;
    for(int i=0; i<expression.size(); i++) {
        if(!isalnum(expression[i])) { 
            string op2=st.top(); st.pop();
            string op1=st.top(); st.pop();
            string temp="("+op1+expression[i]+op2+")";
            st.push(temp);
        } 
        else st.push(string(1, expression[i]));
    }
    return st.top();
}

// 前缀 --> 中缀：逆序遍历，遇到操作数直接压入栈中，遇到操作符弹出两操作数组成新的表达式并压入栈
string prefixToInfix(string expression) {
    stack<string> st;
    for (int i=expression.size()-1; i>=0; i--) {
        if(!isalnum(expression[i])) {
            string op1=st.top(); st.pop();
            string op2=st.top(); st.pop();
            string temp="("+op1+expression[i]+op2+")";
            st.push(temp);
        } 
        else st.push(string(1, expression[i]));
    }
    return st.top();
}

// 后缀表达式计算：思路类似  后缀 --> 中缀
int evalRPN(vector<string>& tokens) {
    stack<int> st;
    for(int i=0; i<tokens.size(); i++) {
        if(isNum(tokens[i])) st.push(atoi(tokens[i].data()));
        else {
            int num2=st.top(); st.pop();
            int num1=st.top(); st.pop();
            switch (tokens[i][0]) {
                case '+':
                    st.push(num1+num2);
                    break;
                case '-':
                    st.push(num1-num2);
                    break;
                case '*':
                    st.push(num1*num2);
                    break;
                case '/':
                    st.push(num1/num2);
                    break;
            }
        }
    }
    return st.top();
}

// 前缀表达式计算：思路类似  前缀 --> 中缀
int evalRPN(vector<string>& tokens) {
    stack<int> st;
    for(int i=tokens.size()-1; i>=0; i--) {
        if(isNum(tokens[i])) st.push(atoi(tokens[i].data()));
        else {
            int num1=st.top(); st.pop();
            int num2=st.top(); st.pop();
            switch (tokens[i][0]) {
                case '+':
                    st.push(num1+num2);
                    break;
                case '-':
                    st.push(num1-num2);
                    break;
                case '*':
                    st.push(num1*num2);
                    break;
                case '/':
                    st.push(num1/num2);
                    break;
            }
        }
    }
    return st.top();
}
       
// 中缀表达式计算：中缀 --> 前缀（以vector<string>收集postfix）,再计算逆波兰式
```

3. 辅助工具

```cpp
// ctype.h：isalpha isdigit isalnum isspace
bool isNum(char it) {return it>='0' && it<='9';}
bool isLetter(char it) {return it>='a' && it<='z';}
bool isSign(char it) {return it=='+' || it=='-' || it=='*' || it=='/';}

// 数字字符串转数字
int AscToInt(const string& s, int& i) {
    int j=i+1;
    while(j<s.size() && isNum(s[j])) j++;
    int len=j-i;
    i=j;
    return atoi(s.substr(i,len).data());
}

// 正负性定义表达式，压缩乘除式
void posORneg(char preSign, int num) {
    switch (preSign) {
        case '+':
            vec.push_back(num);
            break;
        case '-':
            vec.push_back(-num);
            break;
        case '*':
            vec.back()*=num;
            break;
        case '/':
            vec.back()/=num;
            break;
    }
}

// 表达式预处理
void expSpaceDeal(string& s) {
    string tmp;
    for(char ch : s) {
        if(ch!=' ') tmp+=ch;
    }
    s=tmp;
}

void expOneDimDeal(string& s) {
    string tmp;
    for(int i=0; i<s.size(); i++) {
        if(s[i]=='-' && (i==0 || s[i-1]=='(')) tmp+="0-";
        else if(s[i]=='+' && (i==0 || s[i-1]=='(')) tmp+="0+";
        else tmp+=s[i];
    }
    s=tmp;
}

void expSignDeal(string& s) {
    stack<char> st;
    int flag=0;
    string tmp;
    for(int i=0; i<s.size(); i++) {
        if(s[i]=='(') {
        	if(i==0) st.push('+');
            else st.push(s[i-1]);
            if(st.top()=='-') flag=!flag;
        }
        else if(s[i]==')') {
            if(st.top()=='-') flag=!flag;
            st.pop();
        }
        else if(isSign(s[i]) && flag){
            if(s[i]=='+') tmp+='-';
            else tmp+='+';
        }
        else tmp+=s[i];
    }
    s=tmp;
}
```

4. 单调栈

   - 下一更大元素位置

     ```cpp
     //求差
     vector<int> nextGreaterElements(vector<int>& nums) {
         stack<int> st;
         vector<int> res(nums.size(), -1);
         for(int i=0; i<nums.size(); i++) {
             while(!st.empty() && nums[i]>nums[st.top()]) {
                 res[st.top()]=i-st.top();
                 st.pop();
             }
             st.push(i);
         }
         return res;
     }
     
     //数组循环
     vector<int> nextGreaterElements(vector<int>& nums) {
         stack<int> st;
         vector<int> res(nums.size(), -1);
         for(int i=0; i<nums.size()*2; i++) {
             while(!st.empty() && nums[i%nums.size()]>nums[st.top()]) {
                 res[st.top()]=nums[i%nums.size()];
                 st.pop();
             }
             st.push(i%nums.size());
         }
         return res;
     }
     ```

   - 接雨水

     ```cpp
     int trap(vector<int>& height) {		//行累计：凹槽
         stack<int> st;
         int res=0;
         for(int i=0; i<height.size(); i++) {
             while(!st.empty() && height[i]>height[st.top()]) {
                 int bottom=st.top();
                 st.pop();
                 if(!st.empty()) {
                     int left=st.top(), right=i;
                     res+=(min(height[left], height[right])-height[bottom])*(right-left-1);
                 }
             }
             st.push(i);
         }
         return res;
     }
     ------------------------------------------------------------------------------
     int trap(vector<int>& height) {		//列累计：木桶定理
         vector<int> leftMax(height.size(), 0);
         vector<int> rightMax(height.size(), 0);
         for(int i=1; i<height.size(); i++) {
             leftMax[i]=max(leftMax[i-1], height[i-1]);
         }
         for(int i=height.size()-2; i>=0; i--) {
             rightMax[i]=max(rightMax[i+1], height[i+1]);
         }
         int res=0;
         for(int i=1; i<height.size()-1; i++) {
             res+=max(min(rightMax[i], leftMax[i])-height[i], 0);
         }
         return res;
     }
     ```

   - 柱状图最大矩形

     ```cpp
     int largestRectangleArea(vector<int>& heights) {
         heights.insert(heights.begin(), 0);
         heights.push_back(0);
         stack<int> st;
         int res=0;
         for(int i=0; i<heights.size(); i++) {
             while(!st.empty() && heights[i]<heights[st.top()]) {
                 int peak=st.top();
                 st.pop();
                 if(!st.empty()) {
                     int left=st.top(), right=i;
                     res=max(res, (right-left-1)*heights[peak]);
                 }
             }
             st.push(i);
         }
         return res;
     }
     ------------------------------------------------------------------------------
     int largestRectangleArea(vector<int>& heights) {
         vector<int> leftMinIndex(heights.size());
         vector<int> rightMinIndex(heights.size());
         leftMinIndex[0]=-1;
         for(int i=1; i<heights.size(); i++) {
             int checkIndex=i-1;
             while(checkIndex>=0 && heights[checkIndex]>=heights[i]) 
                 checkIndex=leftMinIndex[checkIndex];
             leftMinIndex[i]=checkIndex;
         }
         rightMinIndex[heights.size()-1]=heights.size();
         for(int i=heights.size()-2; i>=0; i--) {
             int checkIndex=i+1;
             while(checkIndex<heights.size() && heights[checkIndex]>=heights[i]) 
                 checkIndex=rightMinIndex[checkIndex];;
             rightMinIndex[i]=checkIndex;
         }
         int res=0;
         for(int i=0; i<heights.size(); i++) {
             res=max(res, heights[i]*(rightMinIndex[i]-leftMinIndex[i]-1));
         }
         return res;
     }
     ```



### 队列

> `priority_queue<Type, Container, Functional>`：
>
> - Type类型数据以Functional优先级排序，Container存储
> - 默认Container为vector，以堆heap为处理规则来管理底层容器实现；Container也可以为deque
> - 默认Functional为大顶堆，可自定义优先级
>
> ```cpp
> class cmp {
> public:
>     bool operator()(const pair<int, int>& lhs, const pair<int, int>& rhs) {
>         return lhs.second > rhs.second;
>     }      
> }; //小顶堆
> 
> priority_queue<pair<int,int>, vector<pair<int,int>>, cmp> pri_que;
> pri_que.top();  					//显示堆顶
> pri_que.pop();						//弹出堆顶
> pri_que.push(val);					//产生一个val副本，再插入队列
> pri_que.emplace(num1,num2);   		//直接传入构造对象需要的元素，内部自动构造一个元素并插入队列
> ```

> 原理：记录已经遍历过的元素，方便随时按顺序取出或查看第一个/最后一个操作
>
> 变化：插入和弹出的时机；确定`!que.empty()`再`que.pop()`或者`que.front()`、`que.back()`

1. 队列to栈

```cpp
class MyStack {
public:
    MyStack() {}
    
    void push(int x) {
        que.push(x);
    }
    
    int pop() {
        int size=que.size();;
        size--;
        while(size--) {
            que.push(que.front());
            que.pop();
        }
        int res=que.front();
        que.pop();
        return res;
    }
    
    int top() {
        return que.back();
    }
    
    bool empty() {
        return que.empty();
    }
private:
    queue<int> que;
};
```

2. 单调队列 - 滑动窗口最值

```cpp
class MyQueue { 
public:
    void pop(int value) {
        if (!que.empty() && value==que.front())
            que.pop_front();
    }
    
    void push(int value) {
        while (!que.empty() && value>que.back())
            que.pop_back();
        que.push_back(value);
    }
	
    int front() {
        return que.front();
    }
private:
    deque<int> que; 
};
```

3. 优先队列 - TOPK

```cpp
class cmp {
    public:
    bool operator()(const pair<int, int>& lhs, const pair<int, int>& rhs) {
        return lhs.second > rhs.second;
    }      
};

priority_queue<pair<int,int>, vector<pair<int,int>>, cmp> pri_que;
for(pair<int,int> p:umap) {
    pri_que.push(p);
    if(pri_que.size()>k) {
        pri_que.pop();
    }
}
```

4. 循环队列

```cpp
//参议院
string predictPartyVictory(string senate) {
        int cycleNum=senate.size();
        queue<int> randiantQue,direQue;
        for(int i=0; i<senate.size(); i++) {
            if(senate[i]=='R') randiantQue.push(i);
            else direQue.push(i);
        }

        while(!randiantQue.empty() && !direQue.empty()) {
            if(randiantQue.front()<direQue.front()) 
                randiantQue.push(randiantQue.front()+cycleNum);
            else direQue.push(direQue.front()+cycleNum);
            randiantQue.pop();
            direQue.pop();
        }
        return randiantQue.empty()?"Dire":"Radiant";
    }
```



### 二叉树

> - **满二叉树：**深度为k时，2^k^-1个节点；若最后一层按序未填满，则为**完全二叉树**
> - **二叉搜索树**：左子树都小于根节点，右子树都大于根节点；左右子树高度差不超过1，则为**平衡二叉搜索树**
>
> 1. 链式存储：构建结构体指针
> 2. 顺序存储：对父节点下标`i`，左孩子下标为`2i+1`，右孩子下标为`2i+2`

> 原理：便于搜索的树形结构
>
> 变化：确定`trversal`方式
>
> 特性：假设二叉树根节点在第0层，深度等于层数，高度等于深度+1
>
> 1. 第i层最多有**2^i**个结点；前i-1层有**2^i-1**个结点；i层二叉树最多有**2^(i+1)-1**个结点。
>
> 2. 有n个结点，深度**k=floor(log(n+1))**
>
> > 2^k-1^<n<=2^(k+1)^-1---->log(n+1)-1<=k<log(n+1)            
>
> 3. n~i~表示度为i的结点的个数，**n个结点形成二叉树有n-1条边**，**(点)n=n0+n1+n2,(边)n-1=0+n1+2*n2--->n0=n2+1**
>
> > - 除了根结点，每生成一个结点要求一条边连接
> > - 每二度结点增加一分支，每单度结点不变分支数，分支最终连接叶子结点
>
> 4. 空子树（空树叶）的数目等于其结点数目加1（） 
>
> > - 0度结点有两空子树，1度结点有一空子树，2度结点没有空子树，一颗非空二叉树的空子树数目为2*n0+n1=n0+n1+n2+1=n+1
> >
> > - 对应的扩充二叉树有2*n个链域/边(扩充的二叉树每个结点一分为2)，原本的n个结点有n-1个链域，所以扩充了n+1个(空)链域
>
> 5. 1开始的层序编号，对任一节点i：如果**i  !=1**，则存在父节点；如果**2i>n**,则不存在子节点；如果**2i+1==n**,则有左孩子，但无右孩子；在**存在**的条件下，父节点为floor(i/2),左子节点为2*i,右子节点为2 *i+1 

1. 定义

```cpp
struct treeNode {
    int val;
    treeNode* left;
    treeNode* right;
    treeNode(int x):val(x), left(NULL), right(NULL) {}
}
```

2. 遍历

```cpp
void preOrder(treeNode* cur, vector<int>& res) {		// 二叉树构造
    if(cur==NULL) return;
    res.push_back(cur->val);
    preOrder(cur->left, res);
    preOrder(cur->right, res);
}
------------------------------------------------------------------------------
void inOrder(treeNode* cur, vector<int>& res) {			// 二叉搜索树
    if(cur==NULL) return;
    inOrder(cur->left, res);
    res.push_back(cur->val);
    inOrder(cur->right, res);
}
------------------------------------------------------------------------------
void postOrder(treeNode* cur, vector<int>& res) {		// 自底向上，递归返回
    if(cur==NULL) return;
    postOrder(cur->left, res);
    postOrder(cur->right, res);
    res.push_back(cur->val);
}
```

```cpp
vector<int> preorderTraversal(TreeNode* root) {		//遍历顺序和二叉树访问顺序一致，顺序衍生
    vector<int> res;
    stack<TreeNode*> st;
    if(root!=NULL) st.push(root);
    
    while(!st.empty()) {
        TreeNode* cur=st.top();
        st.pop();
        res.push_back(cur->val);
        if(cur->right) st.push(cur->right); 
        if(cur->left) st.push(cur->left);
    }
    return res;
}
------------------------------------------------------------------------------
vector<int> inorderTraversal(TreeNode* root) {		//用栈保存左节点，逆向回退
    vector<int> res;
    stack<TreeNode*> st;
    TreeNode* cur=root;
    
    while(cur!=NULL || !st.empty()) {
        if(cur!=NULL) {
            st.push(cur);
            cur=cur->left;
        }
        else {
            cur=st.top();
            st.pop();
            res.push_back(cur->val);
            cur=cur->right;
        }
    }
    return res;
}
------------------------------------------------------------------------------
vector<int> postorderTraversal(TreeNode* root) {
    vector<int> res;
    stack<TreeNode*> st;
    if(root!=NULL) st.push(root);

    while(!st.empty()) {
        TreeNode* cur=st.top();
        st.pop();
        res.push_back(cur->val);
        if(cur->left) st.push(cur->left);
        if(cur->right) st.push(cur->right);
    }
    reverse(res.begin(), res.end());
    return res;
}
------------------------------------------------------------------------------
vector<int> traversal(TreeNode* root) {				
    vector<int> res;
    stack<TreeNode*> st;
    if(root!=NULL) st.push(root);
    
    while (!st.empty()) {
        TreeNode* cur=st.top();
        st.pop();
        if (cur!=NULL) {
            if (cur->right) st.push(cur->right);
            st.push(cur);                          
            st.push(NULL);			//空节点标记
            if (cur->left) st.push(cur->left);    
        } 
        else { 
            cur=st.top();    
            st.pop();
            res.push_back(cur->val); 
        }
    }
    return res;
}
```

```cpp
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    queue<TreeNode*> que;
    if(root!=NULL) que.push(root);

    while(!que.empty()) {
        vector<int> vec;
        int size=que.size();
        for(int i=0; i<size; i++) {
            TreeNode* cur=que.front();
            que.pop();
            vec.push_back(cur->val);
            if(cur->left) que.push(cur->left);
            if(cur->right) que.push(cur->right);
        }
        res.push_back(vec);
    }
    return res;
}
```

3. 翻转

```cpp
TreeNode* invertTree(TreeNode* root) {
        if (root == NULL) return root;
        invertTree(root->left);         
        swap(root->left, root->right); 
        invertTree(root->left);         // 注意 这里依然要遍历左孩子，因为中间节点已经翻转了
        return root;
}
```

4. 对称

```cpp
bool compare(TreeNode* left, TreeNode* right) {
    if (left == NULL && right != NULL) return false;
    else if (left != NULL && right == NULL) return false;
    else if (left == NULL && right == NULL) return true;
    else if (left->val != right->val) return false;
    return compare(left->left, right->right) && compare(left->right, right->left);
}
```

5. 构造

```cpp
TreeNode* traversal(vector<int>& inorder,int inorderBegin, int inorderEnd, vector<int>& postorder, int postorderBegin, int postorderEnd) {
    if(postorderBegin==postorderEnd) return NULL;
    int rootVal=postorder[postorderEnd-1];
    TreeNode* root=new TreeNode(rootVal);
    if(postorderBegin==postorderEnd-1) return root;		//减少可省略

    int rootPos;
    for(rootPos=0; rootPos<inorderEnd; rootPos++) {
        if(inorder[rootPos]==rootVal) {
            break;
        }
    }
    root->left=traversal(inorder, inorderBegin, rootPos, postorder, postorderBegin, postorderBegin+rootPos-inorderBegin);
    root->right=traversal(inorder, rootPos+1, inorderEnd, postorder, postorderBegin+rootPos-inorderBegin, postorderEnd-1);
    return root;
}
------------------------------------------------------------------------------
TreeNode* traversal(vector<int>& inorder,int inorderBegin, int inorderEnd, vector<int>& preorder, int preorderBegin, int preorderEnd) {
    if(preorderBegin==preorderEnd) return NULL;
    int rootVal=preorder[preorderBegin];
    TreeNode* root=new TreeNode(rootVal);
    if(preorderBegin==preorderEnd-1) return root;

    int rootPos;
    for(rootPos=0; rootPos<inorderEnd; rootPos++) {
        if(inorder[rootPos]==rootVal) {
            break;
        }
    }
    root->left=traversal(inorder, inorderBegin, rootPos, preorder, preorderBegin+1, preorderBegin+1+rootPos-inorderBegin);
    root->right=traversal(inorder, rootPos+1, inorderEnd, preorder, preorderBegin+1+rootPos-inorderBegin, preorderEnd);

    return root;
}
```

6. 合并

```cpp
TreeNode* mergeTrees(TreeNode* root1, TreeNode* root2) {
    if(root1==NULL) return root2;
    if(root2==NULL) return root1;
    root1->val+=root2->val;
    root1->left=mergeTrees(root1->left, root2->left);
    root1->right=mergeTrees(root1->right, root2->right);
    return root1;
```

7. 公共祖先

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if(root==p || root==q || root==NULL) return root;

    TreeNode* leftPointer = lowestCommonAncestor(root->left, p , q);
    TreeNode* rightPointer = lowestCommonAncestor(root->right, p , q);

    if(leftPointer!=NULL && rightPointer!=NULL)  return root;
    else if(leftPointer==NULL && rightPointer!=NULL) return rightPointer;
    else if(leftPointer!=NULL && rightPointer==NULL) return leftPointer;
    else return NULL;
}
```

8. 二叉搜索树

   - 查找

     ```cpp
     TreeNode* searchBST(TreeNode* root, int val) {
         if (root == NULL || root->val == val) return root;
         if (root->val > val) return searchBST(root->left, val);
         if (root->val < val) return searchBST(root->right, val);
         return NULL;
     }
     ------------------------------------------------------------------------------
     TreeNode* searchBST(TreeNode* root, int val) {
         while (root!=NULL) {
             if (root->val>val) root=root->left;
             else if (root->val<val) root=root->right;
             else return root;
         }
         return NULL;
     }
     ```

   - 验证

     ```cpp
     vector<int> vec;	//二叉搜索树中序遍历对应数组升序
     void traversal(TreeNode* cur) {
         if(cur==NULL) return;
     
         traversal(cur->left);
         vec.push_back(cur->val);
         traversal(cur->right);
     }
     ------------------------------------------------------------------------------
     TreeNode* pre = NULL; 		// 用来记录前一个节点
     bool isValidBST(TreeNode* root) { 
         if (root==NULL) return true;
         bool left=isValidBST(root->left);
     
         if (pre!=NULL) {
             if(pre->val >= root->val) return false;
         }
         pre = root; 
     
         bool right=isValidBST(root->right);
         return left && right;
     }
     ```

   - 插入

     ```cpp
     TreeNode* insertIntoBST(TreeNode* root, int val) {
         if (root == NULL) {
             TreeNode* node = new TreeNode(val);
             return node;
         }
         if (root->val > val) root->left=insertIntoBST(root->left, val);
         if (root->val < val) root->right=insertIntoBST(root->right, val);
         return root;
     }
     ```

   - 删除

     ```cpp
     TreeNode* deleteNode(TreeNode* root, int key) {
         if(root==NULL) return NULL;
     
         else if(root->val==key) {
             if(root->left==NULL && root->right==NULL) {
                 delete root;
                 return NULL;
             }
             else if(root->left!=NULL && root->right==NULL) {
                 TreeNode* retNode=root->left;
                 delete root;
                 return retNode;
             }
             else if(root->left==NULL && root->right!=NULL) {
                 TreeNode* retNode=root->right;
                 delete root;
                 return retNode;
             }
             else {
                 TreeNode* cur=root->right;
                 while(cur->left!=NULL) {
                     cur=cur->left;
                 }
                 cur->left=root->left;
     
                 TreeNode* retNode=root->right;
                 delete root;
                 return retode;
             }
         }
     
         else if(root->val>key){
             root->left=deleteNode(root->left, key);
         }
         else {
             root->right=deleteNode(root->right, key);
         }
         return root;
     }
     ```

   - 修剪

     ```cpp
     TreeNode* trimBST(TreeNode* root, int low, int high) {
         if(root==NULL) return NULL;
         else if(root->val<low) return trimBST(root->right, low, high);
         else if(root->val>high) return trimBST(root->left, low, high);
         else {
             root->left=trimBST(root->left, low, high);
             root->right=trimBST(root->right, low, high);
             return root;
         }
     }
     ```

   - 平衡构造

     ```cpp
     TreeNode* traversal(vector<int>& nums, int left, int right) {		//自然平衡
         if (left>right) return nullptr;
         int mid = left + ((right-left) / 2);
         TreeNode* root = new TreeNode(nums[mid]);
         root->left = traversal(nums, left, mid - 1);
         root->right = traversal(nums, mid + 1, right);
         return root;
     }
     ```

   - 公共祖先

     ```cpp
     TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {   	//二叉搜索树版
         if(root==NULL) return NULL;
         else if(p->val<root->val && q->val<root->val) return lowestCommonAncestor(root->left, p, q);
         else if(p->val>root->val && q->val>root->val) return lowestCommonAncestor(root->right, p, q);
         else return root;
     }
     ```

   - 累加树

     ```cpp
     void traversal(TreeNode* cur, int& sum) {
         if(cur==NULL) return;
     
         if(cur->right) traversal(cur->right, sum);
         sum+=cur->val;
         cur->val=sum;
         if(cur->left) traversal(cur->left, sum);
     }
     ```



### 回溯

> 原理：最优子结构性质，如组合/切割/子集/排列问题抽象为**树形结构**的==穷举==
>
> 变化：剪枝；函数参数和返回值；递归终止条件；最优子结构对应的递归逻辑
>
> ```cpp
> vector<vector<type>> res;
> vector<type> path;
> vector<bool> used;
> void backtracking(参数) {
> //子集：存放结果
> if(终止条件) {									//组合：到达数量、切割：到达串底部、子集：剩余集合空
>   //组合、切割：存放结果;
>    return;
> }
> 
> for (树本层集合中元素 && 剪枝条件) {					//排列：使用used从0开始尝试
>    处理节点;
>    backtracking(路径，树下一层集合中元素之一);
>    回溯，撤销处理结果;
> }
> }
> ```

1. 框架细节

   - 全局变量和引用传递

     ```cpp
     void traversal(TreeNode* cur, vector<int>& path, vector<vector<int>>& res)
     //等价于
     vector<vector<int>> res;
     vector<int> path;
     void traversal(TreeNode* cur)  
     ```

   - 局部变量和值传递

     ```cpp
     void traversal(TreeNode* cur, vector<int>& path, vector<string>& result) {
         path.push_back(cur->val);					 
         if (cur->left==NULL && cur->right==NULL) {
             string sPath;
             for (int i = 0; i < path.size() - 1; i++) {
                 sPath += to_string(path[i]);
                 sPath += "->";
             }
             sPath += to_string(path[path.size() - 1]);
             result.push_back(sPath);
             return;
         }
         
         if (cur->left) {
             traversal(cur->left, path, result);
             path.pop_back(); 							
         }
         if (cur->right) {
             traversal(cur->right, path, result);
             path.pop_back(); 					
         }
     }
     //对于自顶向下顺序的遍历,可通过值传递免回溯
     void traversal(TreeNode* cur, string path, vector<string>& result) {
         path += to_string(cur->val);
         if (cur->left == NULL && cur->right == NULL) {
             result.push_back(path);
             return;
         }
         if (cur->left) traversal(cur->left, path+"->", result); 
         if (cur->right) traversal(cur->right, path+"->", result); 
     }
     ```

   - 返回值

     ```cpp
     //遍历过程，void
     void traversal(TreeNode* cur) {
         if (cur->left==NULL && cur->right==NULL && ...) {
             res.push_back(path);
             return;
         }
         if (cur->left) {
             target-=cur->left->val;
             path.push_back(cur->left->val);
             traversal(cur->left, targetSum);    
             target+=cur->left->val;       
             path.pop_back();                
         }
         if (cur->right) { 
             target-=cur->right->val;
             path.push_back(cur->right->val);
             traversal(cur->right, targetSum);   
             target+=cur->right->val;      
             path.pop_back();               
         }
         return;
     }
     //寻找某一符合条件的路径（root->leaf），非void，尤其是bool
     bool traversal(TreeNode* cur) {
         if(cur->left==NULL && cur->right==NULL && ...) {
             return true;
         }
         if(cur->left) {
             target-=cur->left->val;
             if(traversal(cur->left)) return true;
             target+=cur->left->val;
         }
         if(cur->right) {
             target-=cur->right->val;
             if(traversal(cur->right)) return true;
             target+=cur->right->val;
         }
         return false;
     }
     //传递返回值并作用于上一轮递归，非void，尤其是type，具体见"root->left"/"root->right" | 二叉树删除/修剪
     TreeNode* traversal(TreeNode* cur) {
         //sth. return node
         root->left=traversal(root->left, val);
         root->right=traversal(root->right, val);
         return root;
     }
     ```

   - 缺头少尾

     ```cpp
     //初始化root，作用下一节点
     targetSum=0;
     targetSum+=root->val;
     void traversal(TreeNode* cur, int targetSum) {
         if (cur->left==NULL && cur->right==NULL && sum==targetSum) {
             res.push_back(path);
             return;
         }
     
         if (cur->left) {
             sum+=cur->left->val;
             path.push_back(cur->left->val);
             traversal(cur->left, targetSum);    
             sum-=cur->left->val;       
             path.pop_back();                
         }
         if (cur->right) { 
             sum+=cur->right->val;
             path.push_back(cur->right->val);
             traversal(cur->right, targetSum);   
             sum-=cur->right->val;      
             path.pop_back();               
         }
         return;
     }
     
     //作用当前节点，下一节点回溯
     void traversal(TreeNode* cur, int& targetSum) {
         sum+=cur->val;
         path.push_back(cur->val);
         if(cur->left==NULL && cur->right==NULL && targetSum==0) {
             res.push_back(path);
             return;
         }
     
         if(cur->left) {
             traversal(cur->left, targetSum);
             sum-=cur->left->val;
             path.pop_back();
         }
         if(cur->right) {
             traversal(cur->right, targetSum);
             sum-=cur->right->val;
             path.pop_back();
         }
     }
     
     //作用当前节点，当前节点回溯，注意补充叶子节点对应回溯
     void traversal(TreeNode* cur, int targetSum){
         sum+=cur->val;
         path.push_back(cur->val);
         if(cur->left==NULL && cur->right==NULL && sum==targetSum) {
             res.push_back(path);									
             //return;   											//不可return,否则要补充末尾当前节点的回溯
         }  
     
         if(cur->left) traversal(cur->left, targetSum);
         if(cur->right) traversal(cur->right, targetSum);
     
         sum-=cur->val;
         path.pop_back();
     }
     ```

2. 组合

   - 非重单集合

     > 未选元素不参与下一轮递归集合，已选元素不参与下一轮递归集合，用startIndex标记

     ```cpp
     //元素1-n k大小组合
     void backtracking(int n, int k,int startIndex) {
         if(path.size()==k) {
             res.push_back(path);
             return;
         }
         for(int i=startIndex; i<=n; i++) {
             path.push_back(i);
             backtracking(n, k, i+1);
             path.pop_back();
         }
     }
     ```

   - 非重多集合

     > 每轮递归遍历对应轮次集合所有元素

     ```cpp
     //9键拼音组合
     void backtracking(const string& digits, int index) {
         if (index == digits.size()) {
             result.push_back(s);
             return;
         }
         string letters=letterMap[digits[index] - '0'];      
         for (int i = 0; i<letters.size(); i++) {
             s.push_back(letters[i]);            
             backtracking(digits, index + 1);    
             s.pop_back();                       
         }
     }
     ```

   - 无限制单集合

     > 未选元素不参与下一轮递归集合，已选元素参与下一轮递归集合，用startIndex标记

     ```cpp
     int sum=0;
     void backtracking(vector<int>& candidates, int target, int startIndex) {
         if (sum==target) {
             result.push_back(path);
             return;
         }
         for (int i=startIndex; i<candidates.size() && sum+candidates[i]<=target; i++) {
             sum += candidates[i];
             path.push_back(candidates[i]);
             backtracking(candidates, target, i);
             sum -= candidates[i];
             path.pop_back();
         }
     }
     ```

   - 可重单集合/==去重==

     > 同一树层不可重，同一树枝可重

     ```cpp
     int sum=0;
     vector<bool> used(candidates.size(), false);
     sort(candidates.begin(), candidates.end());
     void backtracking(int target, vector<int>& candidates, int startIndex) {
         if(sum==target) {
             res.push_back(path);
             return;
         }
         for(int i=startIndex; i<candidates.size() && sum+candidates[i]<=target; i++) {
             if(i>0 && candidates[i]==candidates[i-1] && used[i-1]==false) continue;  	//同树层去重
             
             sum+=candidates[i];
             path.push_back(candidates[i]);
             used[i]=true;
             backtracking(target, candidates, i+1);
             sum-=candidates[i];
             path.pop_back();
             used[i]=false;
         }
     }
     ------------------------------------------------------------------------------
     int sum=0;
     sort(candidates.begin(), candidates.end());
     void backtracking(int target, vector<int>& candidates, int startIndex) {
         if(sum==target) {
             res.push_back(path);
             return;
         }
         for(int i=startIndex; i<candidates.size() && sum+candidates[i]<=target; i++) {
             if(i>startIndex && candidates[i]==candidates[i-1]) continue;				//同树层去重
             
             sum+=candidates[i];
             path.push_back(candidates[i]);
             backtracking(target, candidates, i+1);
             sum-=candidates[i];
             path.pop_back();
         }
     }
     ------------------------------------------------------------------------------
     int sum=0;
     void backtracking(int target, vector<int>& candidates, int startIndex) {
         if(sum==target) {
             res.push_back(path);
             return;
         }
         unordered_set<int> uset;
         for(int i=startIndex; i<candidates.size() && sum+candidates[i]<=target; i++) {
             if(uset.find(candidates[i])==uset.end()){
                 uset.insert(candidates[i]);
                 sum+=candidates[i];
                 path.push_back(candidates[i]);
                 backtracking(target, candidates, i+1);
                 sum-=candidates[i];
                 path.pop_back();
             }
         }
     
     }
     ```

3. 分割

> 选取起始点，用startIndex标记，选取分割点，用i标记，继续分割剩余串

```cpp
void backtracking (const string& s, int startIndex) {
    if (startIndex>=s.size()) {
        result.push_back(path);
        return;
    }
    for (int i=startIndex; i<s.size(); i++) {
        if(isLegalStr(s, startIndex, i)) {   
            string str=s.substr(startIndex, i-startIndex+1);
            path.push_back(str);
            backtracking(s, i+1);
            path.pop_back(); 
        }       
    }
}
```

4. 子集

> 收集所有枝叶

```cpp
void backtracking(vector<int>& nums, int startIndex) {
    result.push_back(path); 
    if (startIndex >= nums.size()) return;

    for (int i=startIndex; i<nums.size(); i++) {
        path.push_back(nums[i]);
        backtracking(nums, i+1);
        path.pop_back();
    }
}
```

5. 排列

> 用`used`标记该元素是否使用

```cpp
void backtracking (vector<int>& nums, vector<bool>& used) {
    if (path.size() == nums.size()) {
        result.push_back(path);
        return;
    }
    for (int i = 0; i < nums.size(); i++) {
        if(used[i] == true) continue; 
        used[i] = true;
        path.push_back(nums[i]);
        backtracking(nums, used);
        path.pop_back();
        used[i] = false;
    }
}
```

6. 解数独

```cpp
bool backtracking(vector<vector<char>>& board) {
    for (int i = 0; i < board.size(); i++) {        // 遍历行
        for (int j = 0; j < board[0].size(); j++) { // 遍历列
            if (board[i][j] != '.') continue;
            for (char k = '1'; k <= '9'; k++) {     // (i, j) 这个位置放k是否合适
                if (isValid(i, j, k, board)) {
                    board[i][j] = k;                
                    if (backtracking(board)) return true; // 如果找到合适一组立刻返回
                    board[i][j] = '.';             
                }
            }
            return false;                           
        }
    }
    return true; 
}

bool isValid(int row, int col, char val, vector<vector<char>>& board) {
    for (int i = 0; i < 9; i++) { 
        if (board[row][i] == val) {
            return false;
        }
    }
    for (int j = 0; j < 9; j++) { 
        if (board[j][col] == val) {
            return false;
        }
    }
    int startRow = (row / 3) * 3;
    int startCol = (col / 3) * 3;
    for (int i = startRow; i < startRow + 3; i++) {
        for (int j = startCol; j < startCol + 3; j++) {
            if (board[i][j] == val ) {
                return false;
            }
        }
    }
    return true;
}
```

7. 重新安排行程

```cpp
unordered_map<string, map<string, int>> targets;
bool backtracking(int ticketNum, vector<string>& plan) {
    if(plan.size()==ticketNum+1) {
        return true;
    }

    for(pair<const string, int>& target : targets[plan[plan.size()-1]]) {
        if(target.second>0) {
            plan.push_back(target.first);
            target.second--;
            if(backtracking(ticketNum, plan)) return true;
            plan.pop_back();
            target.second++;
        }   
    }
    return false;
}

vector<string> findItinerary(vector<vector<string>>& tickets) {
    for(const vector<string> ticket : tickets) {
        targets[ticket[0]][ticket[1]]++;
    }

    vector<string> plan;
    plan.push_back("JFK");
    backtracking(tickets.size(), plan);
    return plan;
}
```



### 贪心

> 模拟尝试：选择**每个子问题的局部最优**，将局部最优堆叠成全局最优，否则dp

1. 分发饼干

```cpp
int findContentChildren(vector<int>& g, vector<int>& s) {
    sort(g.begin(),g.end());
    sort(s.begin(),s.end());
    int index=0;
    for(int i=0; i<s.size(); i++) { // 饼干
        if(index<g.size() && g[index]<=s[i]){ // 胃口
            index++;
        }
    }
    return index;
}
```

2. 摆动序列

```cpp
int wiggleMaxLength(vector<int>& nums) {
    if(nums.size()<=1) return nums.size();

    int res=1;
    int preDiff=0;
    int curDiff;
    for(int i=1; i<nums.size(); i++) {
        curDiff=nums[i]-nums[i-1];
        if((preDiff>=0 && curDiff<0) || (preDiff<=0 && curDiff>0)) {
            res++;
            preDiff=curDiff;
        }
    }
    return res;
}
```

3. 跳跃游戏

```cpp
int jump(vector<int>& nums) {
    int curDis=0;
    int nextDis=0;
    int step=0;
    for(int i=0; i<=curDis; i++) {
        nextDis=max(nextDis, nums[i]+i);
        if(curDis>=nums.size()-1) return step;
        if(i==curDis) {
            step++;
            curDis=nextDis;
        }
    }
    return -1;
}
```

4. 加油站

```cpp
int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int curSum=0;       //为正，则为正作用起点，可为后续积攒力量
    int totalSum=0;     //totalSum>=0那一定可以跑完一圈
    int start=0;

    for(int i=0; i<gas.size(); i++) {
        curSum+=(gas[i]-cost[i]);
        totalSum+=(gas[i]-cost[i]);
        if(curSum<0) {
            start=i+1;
            curSum=0;
        }
    }
    if(totalSum>=0) return start;
    return -1;
}
```

5. 分发糖果

```cpp
int candy(vector<int>& ratings) {
    int size=ratings.size();
    vector<int> candies(size, 1);

    for(int i=1; i<size; i++) {
        if(ratings[i]>ratings[i-1])
            candies[i]=candies[i-1]+1;
    }
    for(int i=size-1; i>0; i--) {
        if(ratings[i-1]>ratings[i]) {
            candies[i-1]=max(candies[i-1], candies[i]+1);
        }
    }

    int candySum=0;
    for(int i=0; i<size; i++) candySum+=candies[i];
    return candySum;
}
```

6. 身高重建队列

```cpp
static bool cmp(vector<int>& a, vector<int>& b) {
        if(a[0]==b[0]) return a[1]<b[1];
        return a[0]>b[0];
    }
vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {
    sort(people.begin(), people.end(), cmp);

    vector<vector<int>> que;
    for(int i=0; i<people.size(); i++) {
        int pos=people[i][1];
        que.insert(que.begin()+pos, people[i]);
    }
    return que;
}
```

7. 重叠区间

```cpp
static bool cmp(const vector<int>& a, const vector<int>& b) {
    return a[0]<b[0]; //左边界排序
}
int OverlapIntervals(vector<vector<int>>& intervals) {
    if(intervals.size()==0) return 0;
    
    sort(intervals.begin(), intervals.end(), cmp);
    int res=0;
    for (int i=1; i<intervals.size(); i++) {
        if (intervals[i][0]<intervals[i-1][1]) { //重叠情况
            intervals[i][1]=min(intervals[i-1][1], intervals[i][1]);
            res++;
        }
    }
    return res;
}
```

8. 非重叠区间

```cpp
static bool cmp (const vector<int>& a, const vector<int>& b) {
    return a[1]<b[1]; // 右边界排序
}
int nonOverlapIntervals(vector<vector<int>>& intervals) {
    if (intervals.size()==0) return 0;
    
    sort(intervals.begin(), intervals.end(), cmp);
    int res=1;
    int end=intervals[0][1];
    for (int i=1; i<intervals.size(); i++) {
        if (end<=intervals[i][0]) {
            end=intervals[i][1];
            res++;
        }
    }
    return res;
}
```

9. 划分字母区间

```cpp
vector<int> partitionLabels(string s) {
    int hash[26]={0};
    for(int i=0; i<s.size(); i++) {
        hash[s[i]-'a']=i;
    }

    vector<int> res;
    int left=0, right=0;
    for(int i=0; i<s.size(); i++) {
        right=max(right, hash[s[i]-'a']);
        if(i==right) {
            res.push_back(right-left+1);
            left=right+1;
        }
    }
    return res;
}
```

10. 单调递增数字

```cpp
int monotoneIncreasingDigits(int n) {
    string strNum=to_string(n);
    int flag=strNum.size();
    for(int i=strNum.size()-1; i>0; i--) {
        if(strNum[i-1]>strNum[i]) {
            strNum[i-1]--;
            flag=i;
        }
    }
    for(int i=flag; i<strNum.size(); i++) {strNum[i]='9';
    return stoi(strNum);
}
```

11. 监控二叉树

```cpp
int res=0;
int traversal(TreeNode* cur) {
    if(cur==NULL) return 2;       
    int left=traversal(cur->left);
    int right=traversal(cur->right);
    if(left==0 || right==0) {
        res++;
        return 1;   
    }
    else if(left==1 || right==1) return 2;
    else return 0;
}

int minCameraCover(TreeNode* root) {
    if(traversal(root)==0) res++;
    return res;
}
```



### 动态规划

> 1. 拆分==子问题==（**拎清问题中各个可能出现的状态，确定dp数组下标含义，组建==dp数组==**）
> 2. 状态dp推导（**确定递推公式**）
> 3. **初始化和dp数组遍历顺序**
> 4. 打印dp数组debug
>
> 注意：通常情况下，dp与带备忘录的递归具有类似问题解决方案

1. 不同路径

```cpp
int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
    if(obstacleGrid[0][0]==1) return 0;		//特殊情况
    int m=obstacleGrid.size();
    int n=obstacleGrid[0].size();
    vector<vector<int>> dp(m, vector<int>(n, 0));
    for(int i=0; i<n && !obstacleGrid[0][i]; i++) dp[0][i]=1;   //!!
    for(int j=1; j<m && !obstacleGrid[j][0]; j++) dp[j][0]=1;   //!!
    for(int i=1; i<m; i++) {
        for(int j=1; j<n; j++) {
            if(!obstacleGrid[i][j]) dp[i][j]=dp[i-1][j]+dp[i][j-1];  //!!
        }
    }
    return dp[m-1][n-1];
}
```

2. 整数拆分

```cpp
int integerBreak(int n) {
    vector<int> dp(n+1);
    dp[2]=1;
    for(int i=3; i<=n; i++) {
        for(int j=1; j<i; j++) {
            dp[i]=max(dp[i], max(j*dp[i-j], j*(i-j)));
        }
    }
    return dp[n];
}
```

3. 不同BST

```cpp
int numTrees(int n) {
    vector<int> dp(n+1, 0);
    dp[0]=1;
    for(int i=1; i<=n; i++) {
        for(int j=1; j<=i; j++) {
            dp[i]+=dp[j-1]*dp[i-j];
        }
    }
    return dp[n];
}
```

4. 背包（填塞状态）

   - 01背包

     ```cpp
     int backPack01(vector<int>& weight, vector<int>& value, int bagWeight) {
         int n=weight.size();
         vector<vector<int>> dp(n, vector<int>(bagWeight+1, 0));
         for(int j=weight[0]; j<=bagWeight; j++) dp[0][j]=value[0];
         
         for(int i=1; i<n; i++) {
             for(int j=1; j<=bagWeight; j++) {
                 if(j<weight[i]) dp[i][j]=dp[i-1][j];
                 else dp[i][j]=max(dp[i-1][j], dp[i-1][j-weight[i]]+value[i]);
             }
         }
         return dp[n-1][bagWeight];
     }
     ------------------------------------------------------------------------------
     int backPack01(vector<int>& weight, vector<int>& value, int bagWeight) {
         vector<vector<int>> dp(bagWeight+1, 0);   
         for(int i=0; i<weight.size(); i++) {
             for(int j=bagWeight; j>=weight[i]; j--) {
                 dp[j]=max(dp[j], dp[j-weight[i]]+value[i]);
             }
         }
         return dp[bagWeight];
     }
     ```

   - 目标和（不同返回值）

     ```cpp
     int targetSumBool(vector<int>& nums, int target) {
         vector<vector<bool>> dp(nums.size(), vector<bool>(target+1, false));  
         if(nums[0]<=target) dp[0][nums[0]]=true;
         for(int k=0; k<nums.size(); k++) dp[k][0]=true;
         
         for(int i=1; i<nums.size(); i++) {
             for(int j=1; j<=target; j++) {
                 if(j<nums[i]) dp[i][j]=dp[i-1][j];
                 else dp[i][j]=dp[i-1][j] || dp[i-1][j-nums[i]];
             }
         }
         return dp[nums.size()-1][target];
     }
     ------------------------------------------------------------------------------
     int targetSumNum(vector<int>& nums, int target) {
         vector<vector<int>> dp(nums.size(), vector<int>(target+1, 0));
         for(int k=nums[0]; k<=target; k++) dp[0][k]=nums[0];
         
         for(int i=1; i<nums.size(); i++) {
             for(int j=1; j<=target; j++) {
                 if(j<nums[i]) dp[i][j]=dp[i-1][j];
                 else dp[i][j]=max(dp[i-1][j], dp[i-1][j-nums[i]]+nums[i]);
             }
         }
         return dp[nums.size()-1][target];
     }
     ------------------------------------------------------------------------------
     int targetSumKind(vector<int>& nums, int target) {
         vector<vector<int>> dp(nums.size(), vector<int>(target+1, 0));
         dp[0][0]=1;
         if(nums[0]<=target) dp[0][nums[0]]+=1;
         for(int k=1; k<nums.size(); k++) {
             dp[k][0]=(nums[k]?dp[k-1][0]:2*dp[k-1][0]);
         }
     
         for(int i=1; i<nums.size(); i++) {
             for(int j=1; j<=target; j++) {
                 if(j<nums[i]) dp[i][j]=dp[i-1][j];
                 else dp[i][j]=dp[i-1][j]+dp[i-1][j-nums[i]];
             }
         }
         return dp[nums.size()-1][target];
     }    
     ```

   - 一和零（多维背包）

     ```cpp
     int findMaxForm(vector<string>& strs, int m, int n) {
         vector<vector<vector<int>>> dp(strs.size(), vector<vector<int>>(m+1, vector<int>(n+1, 0)));
         for(int k=0; k<strs.size(); k++) {
             int zeroNum=0, oneNum=0;
             for(char c : strs[k]) {
                 if(c=='0') zeroNum++;
                 else oneNum++;
             }
             
             if(k==0) {
                 for(int i=zeroNum; i<=m; i++)
                     for(int j=oneNum; j<=n; j++)
                         dp[0][i][j]=1;
             }
             
             else {
                 for(int i=0; i<=m; i++) {
                     for(int j=0; j<=n; j++) {
                         if(zeroNum>i || oneNum>j) dp[k][i][j]=dp[k-1][i][j];
                         else dp[k][i][j]=max(dp[k-1][i][j], dp[k-1][i-zeroNum][j-oneNum]+1);
                     }
                 }
             }
         }
         return dp[strs.size()-1][m][n];
     }
     ------------------------------------------------------------------------------
     int findMaxForm(vector<string>& strs, int m, int n) {
         vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
         for (string str : strs) {
             int  zeroNum=0, oneNum=0;
             for (char c : str) {
                 if (c=='0') zeroNum++;
                 else oneNum++;
             }
     
             for (int i=m; i>=zeroNum; i--) {
                 for (int j=n; j>=oneNum; j--) {
                     dp[i][j] = max(dp[i][j], dp[i-zeroNum][j-oneNum]+1);
                 }
             }
         }
         return dp[m][n];
     }
     ```

   - 完全背包

     > - 01背包：比对上一轮次
     >   - 2d：可调换遍历先后，好理解
     >   - 1d：固定遍历先后，倒序遍历，但简化初始化
     > - 完全背包：比对当前轮次
     >   - 2d：先物品组合，先限制排列，好理解
     >   - 1d：先物品组合，先限制排列，顺序遍历，但简化初始化

     ```cpp
     int backPackComplete(vector<int>& weight, vector<int>& value, int bagWeight) {
         int n=weight.size();
         vector<vector<int>> dp(n, vector<int>(bagWeight+1, 0));
         for(int j=weight[0]; j<=bagWeight; j++) dp[0][j]=bagWeight/weight[0]*value[0];
       
         for(int i=1; i<n; i++) {					    // 组合数，调转为排列数
             for(int j=1; j<=bagWeight; j++) {
                 if(j<weight[i]) dp[i][j]=dp[i-1][j];
                 else dp[i][j]=max(dp[i-1][j], dp[i][j-weight[i]]+value[i]);
             }
         }
         return dp[n-1][bagWeight];
     }
     ------------------------------------------------------------------------------
     int backPackComplete(vector<int>& weight, vector<int>& value, int bagWeight) {
         vector<int> dp(bagWeight+1, 0);
         //init...
         for(int i=0; i<weight.size(); i++) {			// 组合数
             for(int j=weight[i]; j<=bagWeight; j++) {			
                 dp[j]=max(dp[j], dp[j-weight[i]]+value[i]);
             }
         }
         return dp[bagWeight];
     }
     ------------------------------------------------------------------------------
     int backPackComplete(vector<int>& weight, vector<int>& value, int bagWeight) {
         vector<int> dp(bagWeight+1, 0);
         //init...
         for(int j=0; j<=bagWeight; j++) {
             for(int i=0; i<weight.size(); i++) {	   // 排列数
                 if (j>=weight[i]) dp[j]=max(dp[j], dp[j-weight[i]]+value[i]);
             }
         }
         return dp[bagWeight];
     }
     ```

   - 单词拆分（check dp）

     ```cpp
     bool wordBreak(string s, vector<string>& wordDict) {
         unordered_set<string> wordDictSet(wordDict.begin(), wordDict.end());
         vector<bool> dp(s.size()+1, false);
         dp[0]=true;
         for(int j=0; j<=s.size(); j++) {
             for(int i=0; i<j; i++) {
                 if(dp[i]) {
                     string testWord=s.substr(i, j-i);
                     if(wordDictSet.find(testWord)!=wordDictSet.end()) dp[j]=true;
                 }
             }
         }
         return dp[s.size()];
     }
     ```

   - 多重背包

     ```cpp
     //摊开的01背包
     int backPackMulti(vector<int>& weight, vector<int>& value, vector<int>& nums, int bagWeight) {
         vector<vector<int>> dp(bagWeight+1, 0);   
         for(int i=0; i<weight.size(); i++) {
             for(int j=bagWeight; j>=weight[i]; j--) {
                 for(int k=1; k<=nums[i] && (j-k*weight[i])>=0; k++){
                     dp[j]=max(dp[j], dp[j-k*weight[i]]+k*value[i]);
                 }
             }
         }
         return dp[bagWeight];
     }
     ```

5. 打家劫舍（单状态）

```cpp
int rob(vector<int>& nums) {
    if(nums.size()==0) return 0;
    if(nums.size()==1) return nums[0];
    vector<int> dp(nums.size(), 0);
    dp[0]=nums[0];
    dp[1]=max(nums[0], nums[1]);
    for(int i=2; i<nums.size(); i++) {
        dp[i]=max(dp[i-2]+nums[i], dp[i-1]);
    }
    return dp[nums.size()-1];
}
------------------------------------------------------------------------------成环
int robRange(vector<int>& nums, int start, int end) {
    if(end==start) return nums[start];
    vector<int> dp(nums.size(), 0);
    dp[start]=nums[start];
    dp[start+1]=max(nums[start], nums[start+1]);
    for(int i=start+2; i<=end; i++) {
        dp[i]=max(dp[i-2]+nums[i], dp[i-1]);
    }
    return dp[end];
}
int rob(vector<int>& nums) {
    if(nums.size()==0) return 0;
    if(nums.size()==1) return nums[0];
    int res1=robRange(nums, 0, nums.size()-2);
    int res2=robRange(nums, 1, nums.size()-1);
    return max(res1, res2);
}
------------------------------------------------------------------------------成树
vector<int> robTree(TreeNode* cur) {
    if(cur==NULL) return {0, 0};
    vector<int> left=robTree(cur->left);
    vector<int> right=robTree(cur->right);
    int val1=cur->val+left[0]+right[0];
    int val2=max(left[0], left[1])+max(right[0], right[1]);
    return {val2, val1};
}
int rob(TreeNode* root) {
    vector<int> res=robTree(root);
    return max(res[0], res[1]);
}
```

6. 股票（多状态）

   - 一次交易

     ```cpp
     int maxProfit(vector<int>& prices) {		//持有和非持有股票
         vector<vector<int>> dp(prices.size(), vector<int>(2, 0));
         dp[0][0]=-prices[0];
         for(int i=1; i<prices.size(); i++) {
             dp[i][0]=max(dp[i-1][0], -prices[i]);			//买卖当前股票
             dp[i][1]=max(dp[i-1][1], dp[i-1][0]+prices[i]);
         }
         return dp[prices.size()-1][1];
     }
     ```

   - 多次交易

     ```cpp
     int maxProfit(vector<int>& prices) {	
         vector<vector<int>> dp(prices.size(), vector<int>(2, 0));
         dp[0][0]=-prices[0];
         for(int i=1; i<prices.size(); i++) {
             dp[i][0]=max(dp[i-1][0], dp[i-1][1]-prices[i]);
             dp[i][1]=max(dp[i-1][1], dp[i-1][0]+prices[i]);
         }
         return dp[prices.size()-1][1];
     }
     ```

   - k次交易

     ```cpp
     int maxProfit(vector<int>& prices, int k) {  //第i天，第j次买卖，k表买卖状态
         vector<vector<vector<int>>> dp(prices.size(), vector<vector<int>>(k+1, vector<int>(2, 0)));
         for(int x=1; x<=k; x++) dp[0][x][0]=-prices[0];
         for(int i=1; i<prices.size(); i++) {
             for(int j=1; j<=k; j++){
                 dp[i][j][0]=max(dp[i-1][j][0], dp[i-1][j-1][1]-prices[i]);
                 dp[i][j][1]=max(dp[i-1][j][1], dp[i-1][j][0]+prices[i]);
             }
         }
         return dp[prices.size()-1][k][1];
     } 
     ```

   - 冷冻期

     ```cpp
     int maxProfit(vector<int>& prices) {
         vector<vector<int>> dp(prices.size(), vector<int>(4, 0));
         // 0持有股票   1卖股票   2冷冻期   3非持有保持期
         dp[0][0]=-prices[0];
         for(int i=1; i<prices.size(); i++) {
             dp[i][0]=max(dp[i-1][0], max(dp[i-1][2], dp[i-1][3])-prices[i]);
             dp[i][1]=dp[i-1][0]+prices[i];
             dp[i][2]=dp[i-1][1];
             dp[i][3]=max(dp[i-1][2], dp[i-1][3]);
         }
         return max(dp[prices.size()-1][1], max(dp[prices.size()-1][2], dp[prices.size()-1][3]));
     }
     ```

   - 手续期

     ```cpp
     int maxProfit(vector<int>& prices, int fee) {
         vector<vector<int>> dp(prices.size(), vector<int>(2, 0));
         dp[0][0]=-prices[0];
         for(int i=1; i<prices.size(); i++) {
             dp[i][0]=max(dp[i-1][0], dp[i-1][1]-prices[i]);
             dp[i][1]=max(dp[i-1][1], dp[i-1][0]+prices[i]-fee);
         }
         return dp[prices.size()-1][1];
     }
     ```

7. 子序列

   > 1. 以nums[i]结尾的子数组、子序列（涉及前后关系）
   > 2. i长（[0, i-1]）的子序列

   - 最长递增子数组

     ```cpp
     int findLengthOfLCIS(vector<int>& nums) { 
         vector<int> dp(nums.size(), 1);
         int res=1;
         for(int i=1; i<nums.size(); i++) {
             if(nums[i]>nums[i-1]) dp[i]=dp[i-1]+1;
             if(dp[i]>res) res=dp[i];
         }
         return res;
     }
     ```

   - 最长递增子序列

     ```cpp
     int lengthOfLIS(vector<int>& nums) {
         vector<int> dp(nums.size(), 1);
         int res=1;
         for(int i=1; i<nums.size(); i++) {
             for(int j=0; j<i; j++) {
                 if(nums[j]<nums[i]) dp[i]=max(dp[i], dp[j]+1);
             }
             if(dp[i]>res) res=dp[i];
         }
         return res;
     }
     ```

   - 最长递增子序列数目

     ```cpp
     int findNumberOfLIS(vector<int>& nums) {
         vector<int> dp(nums.size(), 1);
         vector<int> count(nums.size(), 1);
         int maxLength=1;
         for(int i=1; i<nums.size(); i++) {
             for(int j=0; j<i; j++) {
                 if(nums[i]>nums[j]) {
                     if(dp[j]+1>dp[i]) {
                         count[i]=count[j];
                         dp[i]=dp[j]+1;
                     }
                     else if(dp[j]+1==dp[i]) count[i]+=count[j];
                     else continue;
                 }
             }
             if(dp[i]>maxLength) maxLength=dp[i];
         }
     
         int res=0;
         for(int i=0; i<count.size(); i++) {
             if(maxLength==dp[i]) 
                 res+=count[i];
         }
         return res;
     }
     ```

   - 最长公共子数组

     ```cpp
     int findLength(vector<int>& nums1, vector<int>& nums2) {
         vector<vector<int>> dp(nums1.size()+1, vector<int>(nums2.size()+1, 0));
         int res=0;
         for(int i=1; i<=nums1.size(); i++) {
             for(int j=1; j<=nums2.size(); j++) {
                 if(nums1[i-1]==nums2[j-1]) dp[i][j]=dp[i-1][j-1]+1;
                 if(dp[i][j]>res) res=dp[i][j];
             }
         }
         return res;
     }
     ```

   - 最长公共子序列

     ```cpp
     int longestCommonSubsequence(vector<int>& nums1, vector<int>& nums2) {
         vector<vector<int>> dp(nums1.size()+1, vector<int>(nums2.size()+1, 0));
         for(int i=1; i<=nums1.size(); i++) {
             for(int j=1; j<=nums2.size(); j++) {
                 if(nums1[i-1]==nums2[j-1]) dp[i][j]=dp[i-1][j-1]+1;
                 else dp[i][j]=max(dp[i-1][j], dp[i][j-1]);
             }
         }
         return dp[nums1.size()][nums2.size()];
     }
     ```

   - 最大子数组和

     ```cpp
     int maxSubArray(vector<int>& nums) {
         vector<int> dp(nums.size(), 0);
         dp[0]=nums[0];
         int res=dp[0];
         for(int i=1; i<nums.size(); i++) {
             dp[i]=max(nums[i], dp[i-1]+nums[i]);
             if(dp[i]>res) res=dp[i];
         }
         return res;
     }
     ```

   - 编辑距离

     - 判断子序列

       ```cpp
       bool isSubsequence(string s, string t) {
           vector<vector<int>> dp(s.size()+1, vector<int>(t.size()+1, 0));
           for(int i=1; i<=s.size(); i++) {
               for(int j=1; j<=t.size(); j++) {
                   if(s[i-1]==t[j-1]) dp[i][j]=dp[i-1][j-1]+1;
                   else dp[i][j]=dp[i][j-1];
               }
           }
           return dp[s.size()][t.size()]==s.size();
       }
       ```

     - 子序列数目

       ```cpp
       int numDistinct(string s, string t) {
           vector<vector<uint64_t>> dp(s.size()+1, vector<uint64_t>(t.size()+1, 0));
           for(int i=0; i<=s.size(); i++) dp[i][0]=1;
           for(int i=1; i<=s.size(); i++) {
               for(int j=1; j<=t.size(); j++) {
                   if(s[i-1]==t[j-1]) dp[i][j]=dp[i-1][j-1]+dp[i-1][j];
                   else dp[i][j]=dp[i-1][j];
               }
           }
           return dp[s.size()][t.size()];
       }
       ```

     - 逆操作：删除至子序列

       ```cpp
       int minDistance(string word1, string word2) {
           vector<vector<int>> dp(word1.size()+1, vector<int>(word2.size()+1, 0));
           for(int i=1; i<=word1.size(); i++) dp[i][0]=i;
           for(int j=1; j<=word2.size(); j++) dp[0][j]=j;
           dp[0][0]=0;
           for(int i=1; i<=word1.size(); i++) {
               for(int j=1; j<=word2.size(); j++) {
                   if(word1[i-1]==word2[j-1]) dp[i][j]=dp[i-1][j-1];
                   else dp[i][j]=min(dp[i-1][j]+1, dp[i][j-1]+1);
               }
           }
           return dp[word1.size()][word2.size()];
       }
       ```

     - 子序列删改

       ```
       int minDistance(string word1, string word2) {
           vector<vector<int>> dp(word1.size()+1, vector<int>(word2.size()+1, 0));
           for(int i=1; i<=word1.size(); i++) dp[i][0]=i;
           for(int j=1; j<=word2.size(); j++) dp[0][j]=j;
           dp[0][0]=0;
           for(int i=1; i<=word1.size(); i++) {
               for(int j=1; j<=word2.size(); j++) {
                   if(word1[i-1]==word2[j-1]) dp[i][j]=dp[i-1][j-1];
                   else dp[i][j]=min({dp[i-1][j-1], dp[i-1][j], dp[i][j-1]})+1;
               }
           }
           return dp[word1.size()][word2.size()];
       }
       ```

   - 回文

     - 回文子串数目

       ```cpp
       int countSubstrings(string s) {
           vector<vector<bool>> dp(s.size(), vector<bool>(s.size(), false));
           int res=0;
           for(int i=s.size()-1; i>=0; i--) {
               for(int j=i; j<s.size(); j++) {
                   if(s[i]==s[j] && (i+1>=j-1 || dp[i+1][j-1])) {
                       res++;
                       dp[i][j]= true;
                   }
               }
           }
           return res;
       }
       ```

     - 最长回文子序列

       ```cpp
       int longestPalindromeSubseq(string s) {
           vector<vector<int>> dp(s.size(), vector<int>(s.size(), 0));
           for(int i=s.size()-1; i>=0; i--) {
               for(int j=i; j<s.size(); j++) {
                   if(s[i]==s[j]) {
                       if(i+1>j-1) dp[i][j]=j-i+1;
                       else dp[i][j]=dp[i+1][j-1]+2;
                   }
                   else dp[i][j]=max(dp[i+1][j], dp[i][j-1]);
               }
           }
           return dp[0][s.size()-1];
       }
       ```

     - 最长回文子串

       ```cpp
       string longestPalindrome(string s) {
           vector<vector<int>> dp(s.size(), vector<int>(s.size(), 0));
           int maxLength=1;
           int maxLeft=0;
           for(int i=s.size()-1; i>=0; i--) {
               for(int j=i; j<s.size(); j++) {
                   if(s[i]==s[j] && (i+1>=j-1 || dp[i+1][j-1])) {
                       dp[i][j]=j-i+1;
                       if(dp[i][j]>maxLength) {
                           maxLeft=i;
                           maxLength=dp[i][j];
                       }
                   }
               }
           }
           return s.substr(maxLeft, maxLength);
       }
       ```

     - 分割回文串

       ```cpp
       int minCut(string s) {
           vector<vector<bool>> isPabindrome(s.size(), vector<bool>(s.size(), false));
           for(int i=s.size()-1; i>=0; i--) {
               for(int j=i; j<s.size(); j++) {
                   if(s[i]==s[j] && (i+1>=j-1 || isPabindrome[i+1][j-1])) {
                       isPabindrome[i][j]=true;
                   }
               }
           }
       
           vector<int> dp(s.size(), INT_MAX);
           dp[0]=0;
           for(int i=1; i<s.size(); i++) {
               if(isPabindrome[0][i]) dp[i]=0;
               else {
                   for(int j=0; j<i; j++) {
                       if(isPabindrome[j+1][i]) {
                           dp[i]=min(dp[i], dp[j]+1);
                       }
                   }
               }
           }
           return dp[s.size()-1];
       }
       ```



### 图论

> - 连通图：在无向图中，任何两个节点都是可以到达的
>   - 连通分量：在无向图中的极大连通子图
> - 强连通图：在有向图中，任何两个节点是可以相互到达的
>   - 强连通分量：在有向图中的极大强连通子图
>
> 1. 邻接矩阵：graph[startp] [endp]=weight；对稀疏图申请空间浪费，找邻点遍历时间复杂
> 2. 邻接表：point arr + edge list；边存在检查复杂
>
> - [ ] dfs：与回溯一致，用终止条件、遍历和处理节点、递归、回溯状态实现
>
> - [ ] bfs：用队列逐个遍历并加入新节点
>
>   **visited**：记录已搜索节点，防止重复搜索

1. 定义

```cpp
vector<vector<int>> graph(row+1, vector<int>(col+1, 0));
while (col--) {								for(int i=0; i<n; i++) {
    cin >>s>>t;    								for(int j=0; j<m; j++) 
    graph[s][t]=1;									cin>>graph[i][j];
} 											}		
------------------------------------------------------------------------------
vector<list<int>> graph(n+1); 
while (m--) {
    cin >>s>>t;
    graph[s].push_back(t);
}
```

2. 最大岛屿

```cpp
int n, m;
int count;
int dir[4][2]={0, 1, 0, -1, 1, 0, -1, 0};
void bfs(vector<vector<int>>& grid, int x, int y, int mark) {
    grid[x][y]=mark;
    count++;
    queue<pair<int,int>> que;
    que.push({x, y});
    while(!que.empty()) {
        pair<int, int> cur=que.front();
        que.pop();
        int curx=cur.first;
        int cury=cur.second;
        for(int i=0; i<4; i++) {
            int nextx=curx+dir[i][0];
            int nexty=cury+dir[i][1];
            if(nextx<0 || nexty<0 || nextx>=n || nexty>=m) continue;
            if(grid[nextx][nexty]==1) {
                grid[nextx][nexty]=mark;
                count++;
                que.push({nextx, nexty});
            }
        }
    }
}

int maxLand(vector<vector<int>>& grid,) {
    n=grid.size();
    m=grid[0].size();
    unordered_map<int, int> umap; //mark -> area
    umap[0]=0;
    int mark=2;
    
    int allLand=true;
    for(int i=0; i<n; i++) {
        for(int j=0; j<m; j++) {
            if(grid[i][j]==0) allLand=false;
            if(grid[i][j]==1) {
                count=0;
                bfs(grid, i, j, mark);
                umap[mark]=count;
                mark++;
            }
        }
    }
    if(allLand) return n*m;
    
    int res=0;
    unordered_set<int> uset;
    for(int i=0; i<n; i++) {
        for(int j=0; j<m; j++) {
            if(grid[i][j]==0) {
                int area=1;
                uset.clear();
                for(int k=0; k<4; k++) {
                    int nearx=i+dir[k][0];
                    int neary=j+dir[k][1];
                    if(nearx<0 || neary<0 || nearx>=n || neary>=m) continue;
                    if(uset.find(grid[nearx][neary])!=uset.end()) continue;
                    area+=umap[grid[nearx][neary]];
                    uset.insert(grid[nearx][neary]);
                }
                if(res<area) res=area;
            }
        }
    }
    return res;
}
```

3. 单词接龙

```cpp
unordered_map<string, int> wordIdMap;
int wordId=0;
vector<vector<int>> graph;
void addPoint(string& word) {
    if(wordIdMap.find(word)==wordIdMap.end())
        wordIdMap[word]=wordId++;
    graph.emplace_back();
}
void addEdge(string& word) {
    addPoint(word);
    int id1=wordIdMap[word];
    for(char& it : word) {
        char tmp=it;
        it='*';
        addPoint(word);
        int id2=wordIdMap[word];
        graph[id1].push_back(id2);
        graph[id2].push_back(id1);
        it=tmp;
    }
}

int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    addEdge(beginWord);
    for(string& word : wordList) addEdge(word);
    if(wordIdMap.find(endWord)==wordIdMap.end()) return 0;

    int start=wordIdMap[beginWord], end=wordIdMap[endWord];
    vector<int> minDist(wordId, INT_MAX);
    queue<int> que;
    que.push(start);
    minDist[start]=0;
    while(!que.empty()) {
        int cur=que.front();
        que.pop();
        if(cur==end) return 1+minDist[end]/2;
        for(int next : graph[cur]) {
            if(minDist[next]>minDist[cur]+1) {
                minDist[next]=minDist[cur]+1;
                que.push(next);
            }
        }
    }
    return 0;
}
```

4. 搜索

   - dfs

     ```cpp
     visited[x][y]=true;    //初始化
     void dfs(const vector<vector<int>>& grid, vector<vector<bool>>& visited, int curx, int cury) {
         for (int i = 0; i < 4; i++) {
             int nextx = curx + dir[i][0];
             int nexty = cury + dir[i][1];
             if (nextx<0 || nextx>=grid.size() || nexty<0 || nexty>=grid[0].size()) continue;
             if (!visited[nextx][nexty] && grid[nextx][nexty]) {
                 visited[nextx][nexty] = true;
                 dfs(grid, visited, nextx, nexty);
             }
         }
     }
     ```

   - bfs

     ```cpp
     void bfs(const vector<vector<int>>& grid, vector<vector<bool>>& visited, int x, int y) {
         visited[x][y]=true;   //初始化
         queue<pair<int, int>> que;
         que.push({x, y}); 
         while(!que.empty()) {
             pair<int ,int> cur=que.front(); 
             que.pop();
             int curx=cur.first;
             int cury=cur.second;
             for (int i=0; i<4; i++) {
                 int nextx=curx+dir[i][0];
                 int nexty=cury+dir[i][1];
                 if (nextx<0 || nextx>=grid.size() || nexty<0 || nexty>=grid[0].size()) continue;
                 if (!visited[nextx][nexty] && grid[nextx][nexty]) {
                     visited[nextx][nexty]=true;
                     que.push({nextx, nexty});   
                 }
             }
         }
     }
     ```

   - dijsktra

     ```cpp
     //非负权值 
     class mycomparison {
     public:
         bool operator()(const pair<int, int>& lhs, const pair<int, int>& rhs) {
             return lhs.second>rhs.second;
         }
     };
     void dijsktra(const vector<list<pair<int, int>>> grid, int n, int start, int end) {
         vector<int> minDist(n+1, INT_MAX);
         vector<bool> visited(n+1, false);
         priority_queue<pair<int, int>, vector<pair<int, int>>, mycomparison> pq;
         vector<int> parent(n+1, -1);
         minDist[start]=0;
         pq.push({start, 0});
         
         while(!pq.empty()) {
             pair<int, int> closeP=pq.top();
             pq.pop();
             if(!visited[closeP.first]) {
                 visited[closeP.first]=true;
                 for(pair<int, int> neighbor : grid[closeP.first]) {
                     if(!visited[neighbor.first] && minDist[closeP.first]+neighbor.second<minDist[neighbor.first]) {
                         minDist[neighbor.first]=minDist[closeP.first]+neighbor.second;
                         parent[neighbor.first]=closeP.first;
                         pq.push({neighbor.first, minDist[neighbor.first]});
                     }
                 }
             }
         } 
         if(minDist[end]==INT_MAX) cout<<-1;
         else cout<<minDist[end];
     }
     ```

   - Bellman.ford

     - 队列优化

       ```cpp
       //无负权回路
       void spfa(const vector<list<pair<int, int>>> grid, int n, int start, int end) {
           vector<int> minDist(n+1, INT_MAX);
           vector<int> counter(n+1, 0);
           queue<int> que;
           minDist[start]=0;
           counter[start]++;
           que.push(start);
           while(!que.empty()) {
               int relaxP=que.front();
               que.pop();
               for(pair<int, int> edge : grid[relaxP]) {
                   if(minDist[edge.first]>minDist[relaxP]+edge.second)) {
                       minDist[edge.first]=minDist[relaxP]+edge.second;
                       que.push(edge.first);
                       if(counter[edge.first]==n) {
                           cout<<"circle";
                           return;
                       }
                   }
               }
           }
           if(minDist[end]==INT_MAX) cout<<-1;
           else cout<<minDist[end];
       }
       ```

     - 负值回路

       ```cpp
       //sfpa也可以，但是复杂
       void bellmanFord(const vector<list<pair<int, int>>> grid, int n, int start, int end) {
           vector<int> minDist(n+1, INT_MAX);
           minDist[start]=0;
           int relaxN=n;
           while(relaxN--) {
               for(int i=1; i<=n; i++) {
                   for(pair<int, int>& edge : grid[i]) {
                       if(minDist[i]!=INT_MAX && minDist[edge.first]>minDist[i]+edge.second) {
                           minDist[edge.first]=minDist[i]+edge.second;
                           if(relaxN==0) {
                               cout<<"circle";
                               return 0;
                           }
                       }
                   }
               }
           }
           if(minDist[end]==INT_MAX) cout<<"unconnected";
           else cout<<minDist[end];
       }
       ```

     - 有限负值回路

       ```cpp
       //确保第i轮优化是基于i-1条边路径对应minDist得到的i条边路径对应minDist，以避免结果产生超过k次的经过
       void bellmanFordwithnloop(const vector<list<pair<int, int>>> grid, int n, int start, int end, int k) { 
           vector<int> minDist(n+1, INT_MAX);
           vector<int> minDist_copy(n+1);
           minDist[start]=0;
           int checkN=k+1;
           while(checkN--) {
               minDist_copy=minDist;
               for(int i=1; i<=n; i++) {
                   for(pair<int, int> edge : grid[i]) {
                       if(minDist_copy[i]!=INT_MAX && minDist[edge.first]>minDist_copy[i]+edge.second) {
                           minDist[edge.first]=minDist_copy[i]+edge.second;
                       }
                   }
               }
           }
           if(minDist[end]==INT_MAX) cout<<"unreachable";
           else cout<<minDist[end];
       }
       ```

   - Floyd

     ```cpp
     vector<vector<vector<int>>> bellmanFordwithnloop(vector<vector<vector<int>>>& grid, int m) { 
         while(m--) {
             cin>>u>>v>>w;
             grid[u][v][0]=w;
             grid[v][u][0]=w;
         }
         for(int k=1; k<=n; k++) {
             for(int i=1; i<=n; i++) {
                 for(int j=1; j<=n; j++) {
                     if(grid[i][k][k-1]!=INT_MAX && grid[k][j][k-1]!=INT_MAX)
                         grid[i][j][k]=min(grid[i][j][k-1], grid[i][k][k-1]+grid[k][j][k-1]);
                     else grid[i][j][k]=grid[i][j][k-1];
                 }
             }
         }
         return grid;
     }
     ```

   - Astar

     ```cpp
     //权衡效果和时间效率，取决于启发式函数
     int moves[1001][1001];
     int dir[8][2]={-2, -1, -2, 1, -1, 2, 1, 2, 2, 1, 2, -1, 1, -2, -1, -2};
     class mycomparison {
     public:
         bool operator()(const pair<pair<int,int>, int>& lhs, const pair<pair<int,int>, int>& rhs) {
             return lhs.second>rhs.second;
         }
     };
     int heuristic(const pair<int, int>& p, const pair<int, int>& end) {
         return (p.first-end.first)*(p.first-end.first) + (p.second-end.second)*(p.second-end.second); 
     }
     
     void astar(pair<int, int>&start, pair<int, int>& end) {
         priority_queue<pair<pair<int,int>, int>, vector<pair<pair<int,int>, int>>, mycomparison> pq;
         pq.push({start, 0+heuristic(start,end)});
         while(!pq.empty()) {
             pair<pair<int,int>, int> cur=pq.top();
             pq.pop();
             pair<int, int> curP=cur.first;
             if(curP==end) break;
             for(int i=0; i<8; i++) {
                 pair<int, int> nextP={curP.first+dir[i][0], curP.second+dir[i][1]};
                 if(nextP.first<=0 || nextP.first>size || nextP.second<=0 || nextP.second>size) continue;
                 if(!moves[nextP.first][nextP.second]) {
                     moves[nextP.first][nextP.second]=moves[curP.first][curP.second]+1;
                     pq.push({nextP, moves[nextP.first][nextP.second]*5+heuristic(nextP, end)});
                 }
             }
         }
         return moves[end.first][end.second];
     }
     ```

5. 最小生成树

   - prim

     ```cpp
     void prim(const vector<vector<int>>& grid, int n) {
         vector<int> minDist(n+1, INT_MAX);	//最小生成树最短距离
         vector<bool> isInTree(n+1, false);
         vector<int> parent(n+1, -1);
         int treeE=n;
         minDist[1]=0;
         while(treeE--) {
             int closeP=1, closeVal=INT_MAX;
             for(int i=1; i<=n; i++) {
                 if(!isInTree[i] && minDist[i]<closeVal) {
                     closeP=i;
                     closeVal=minDist[i];
                 }
             }
             isInTree[closeP]=true;
             for(int j=1; j<=n; j++) {
                 if(!isInTree[j] && minDist[j]>grid[closeP][j]) 
                     minDist[j]=grid[closeP][j];
                 	parent[j]=closeP;
             }
         }
     }
     ```

   - Kruskal

     ```cpp
     int n=10001;
     vector<int> father(n);
     void init() {
         for(int i=1; i<n; i++) father[i]=i;
     }
     int findRoot(int u) {
         return u==father[u]? u:father[u]=findRoot(father[u]);
     }
     bool isSame(int u, int v) {
         u=findRoot(u);
         v=findRoot(v);
         return u==v;
     }
     void join(int u, int v) {
         u=findRoot(u);
         v=findRoot(v);
         if(u==v) return;
         father[v]=u;
     }
     
     void kruskal(vector<pair<pair<int,int>, int>>& edges, ) {
          sort(edges.begin(), edges.end(), [](const pair<pair<int,int>, int>& lhs, const pair<pair<int,int>, int>& rhs) {
             return lhs.second<rhs.second;
         });
         init();
         vector<pair<pair<int,int> res;
         for(auto& edge : edges) {
             if(isSame(edge.first.first, edge.first.second)) continue;
             res.push_back(edge);
             join(edge.first.first, edge.first.second);
         }
     }
     ```

6. 拓扑排序

```cpp
vector<int> topoSort(vector<list<int>>& graph, ) {
    vector<int> inDegree(n, 0);
    for(int i=0; i<graph.size(); i++) {
        for(int to : graph[i]) {
            inDegree[to]++;
        }
    }
    queue<int> que;
    for(int i=0; i<n; i++) {
        if(inDegree[i]==0)
            que.push(i);
    }
    vector<int> res;
    while(!que.empty()) {
        int dealFile=que.front();
        que.pop();
        res.push_back(dealFile);
        
        for(int nextFile : graph[dealFile]) {
            inDegree[nextFile]--;
            if(inDegree[nextFile]==0) que.push(nextFile);
        }
    }
}
```



### 并查集

> 原理：构建`root`树，检查两元素是否在统一集合，用于`区分树图`、`检查无向连通`
>
> 变化：`father`大小`n`

1. 定义

```cpp
int n=1005;
vector<int> father=vector<int>(n, 0);

void init() {
	for(int i=0; i<n; i++)
        father[i]=i;
}

int findRoot(int u) {
    return u==father[u]? u:father[u]=find(father[u]);		//寻根并路径压缩
}

bool isSame(int u, int v) {
    u=findRoot(u);
    v=findRoot(v);
    return u==v;
}

void join(int u, int v) {
    u=findRoot(u);
    v=findRoot(v);
    if(u==v) return;
    father[v]=u;
}
```

2. 冗余连接II

```cpp
bool checkTreeDelete(const vector<vector<int>>& edges, int deleteEdgeID) {
    init();
    for(int i=0; i<edges.size(); i++) {
        if(i==deleteEdgeID) continue;
        if(isSame(edges[i][0], edges[i][1])) return false;
        join(edges[i][0], edges[i][1]);
    }
    return true;
}
vector<int> checkCircleDelte(vector<vector<int>>& edges) {
    init();
    for(int i=0; i<edges.size(); i++) {
        if(isSame(edges[i][0], edges[i][1])) return edges[i];
        join(edges[i][0], edges[i][1]);
    }
    return {};
}
vector<int> findRedundantDirectedConnection(vector<vector<int>>& edges) {
    vector<int> inDegree=vector<int>(n, 0);
    for(vector<int> uv : edges) inDegree[uv[1]]++;
    vector<int> maybeEdgeIDs;
    for(int i=0; i<edges.size(); i++) {
        if(inDegree[edges[i][1]]==2)
            maybeEdgeIDs.push_back(i);
    }
    if(maybeEdgeIDs.size()) {
        if(checkTreeDelete(edges, maybeEdgeIDs[1])) return edges[maybeEdgeIDs[1]];
        else return edges[maybeEdgeIDs[0]];
    }
    return checkCircleDelte(edges);
}
```



### 位运算

1. bit转化

```cpp
string bitChange(int num) {
    string bitNum="";
    while(num) {
        if(num&1==1) bitNum="1"+bitNum;
        else bitNum="0"+bitNum;
        num>>=1;
    }
    return bitNum;
}
```

2. bit各位和

```cpp
int bitCount(int n) {
    int count = 0;
    while (n) {
        n &= (n - 1); 		// 清除最低位的1
        count++;
    }
    return count;
}
```

3. bit码

```txt
- 原码：在数据字长内，最高位存放符号，其余位存放真值绝对值
- 反码：为降低电路难度（转减法为加法），利用同余思想，对负数原码其余位取反，恰好符号位可参与运算
- 补码：为解决0的编码问题，对负数反码加一，模数自增
```



## 时间复杂度

1. 超时

   - 算法死循环\栈溢出，debug算法

   - 问题需要更低的时间复杂度算法，采用更多的空间或者简便的算法补齐

   - 提高机器、语言、编译器的强度


2. 复杂度计算

   - 大O表示法：算法复杂度是关于问题规模n的运行单元数/内存空间的渐进

   - 复杂度计算会**忽略低阶项和常数项**，但实际由于问题规模和忽略项的大小会存在很大的差异

   - O(1)常数阶 < O(logn)对数阶 < O(n)线性阶 < O(n^2)平方阶 < O(n^3)立方阶 < O(2^n)指数阶

   - 递归算法复杂度=递归的次数 * 每次递归中的操作次数/内存要求，一般可以通过树形结构计算

   - 空间复杂度S(n)一般不包括程序本身，仅考虑程序运行时占用内存的大小，注意**传参形式**：传值调用、指针调用、引用调用




## 其他

1. 几个常见但不容易被发现的bug。

   - 注意`++a`和`a++`  产生边界问题

   - 注意**数据类型**溢出  导致结果出错

   - **for循环末尾对变量的变换  没有被考虑**

   - 多运行而不是大脑模拟


------



2. CCF 编译出错原因： 不允许cppSTL容器嵌套。

```cpp
map<string,list<string> > user;
```

就是要在后面的“>”之间，必须得有一个空格，如果有多层，那每层都得有一个空格。
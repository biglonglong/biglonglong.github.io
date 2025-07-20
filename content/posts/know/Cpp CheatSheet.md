---
draft: false

title: "Cpp CheatSheet"
description: "代码规范和一些写算法题的常用 Cpp 结构"
date: 2024-07-11
author: ["biglonglong"]

tags: ["summary", "algorithm", "cpp"]
summary: ""

math: false
weight: 102
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

#### string

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

#### vector

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

#### list

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

#### stack

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

#### queue

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

#### deque

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

#### set

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

#### pair

```cpp
/*
#include <utility>,pair二元组或元素对*/

pair<type1,type2> p          						//	生成一个<type1,type2>类型空二元组
p.first												//	定义/返回二元组p的第一个元素
p.second											//	定义/返回二元组p的第二个元素
make_pair(val1,val2)								//  以val1为键,val2为值初始化p
    
<、>、<=、>=、==、!=								 	//  按照字典序比较，先比较first，first相等时再比较second
```

#### map

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

#### bitset

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

| 不修改内容的序列函数              | 说明                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| adjacent_find                     | 查找两个相邻（Adjacent）的等价（Identical）元素                 |
| all_ofC++11                       | 检测在给定范围中是否所有元素都满足给定的条件                    |
| any_ofC++11                       | 检测在给定范围中是否存在元素满足给定条件                        |
| count                             | 返回值等价于给定值的元素的个数                                  |
| count_if                          | 返回值满足给定条件的元素的个数                                  |
| equal                             | 返回两个范围是否相等                                            |
| find                              | 返回第一个值等价于给定值的元素                                  |
| find_end                          | 查找范围*A*中与范围*B*等价的子范围最后出现的位置                |
| find_first_of                     | 查找范围*A*中第一个与范围*B*中任一元素等价的元素的位置          |
| find_if                           | 返回第一个值满足给定条件的元素                                  |
| find_if_notC++11                  | 返回第一个值不满足给定条件的元素                                |
| for_each                          | 对范围中的每个元素调用指定函数                                  |
| mismatch                          | 返回两个范围中第一个元素不等价的位置                            |
| none_ofC++11                      | 检测在给定范围中是否不存在元素满足给定的条件                    |
| search                            | 在范围*A*中查找第一个与范围*B*等价的子范围的位置                |
| search_n                          | 在给定范围中查找第一个连续*n*个元素都等价于给定值的子范围的位置 |
| **accumulate(first, last, init)** | 以init为初值计算指定序列[first, last)的累加和                   |

| 修改内容的序列操作函数               | 说明                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------- |
| copy                                 | 将一个范围中的元素拷贝到新的位置处                                     |
| copy_backward                        | 将一个范围中的元素按逆序拷贝到新的位置处                               |
| copy_ifC++11                         | 将一个范围中满足给定条件的元素拷贝到新的位置处                         |
| copy_nC++11                          | 拷贝 n 个元素到新的位置处                                              |
| fill                                 | 将一个范围的元素赋值为给定值                                           |
| fill_n                               | 将某个位置开始的 n 个元素赋值为给定值                                  |
| generate                             | 将一个函数的执行结果保存到指定范围的元素中，用于批量赋值范围中的元素   |
| generate_n                           | 将一个函数的执行结果保存到指定位置开始的 n 个元素中                    |
| iter_swap                            | 交换两个迭代器（Iterator）指向的元素                                   |
| moveC++11                            | 将一个范围中的元素移动到新的位置处                                     |
| move_backwardC++11                   | 将一个范围中的元素按逆序移动到新的位置处                               |
| random_shuffle                       | 随机打乱指定范围中的元素的位置                                         |
| remove                               | 将一个范围中值等价于给定值的元素删除                                   |
| remove_if                            | 将一个范围中值满足给定条件的元素删除                                   |
| remove_copy                          | 拷贝一个范围的元素，将其中值等价于给定值的元素删除                     |
| remove_copy_if                       | 拷贝一个范围的元素，将其中值满足给定条件的元素删除                     |
| replace                              | 将一个范围中值等价于给定值的元素赋值为新的值                           |
| replace_copy                         | 拷贝一个范围的元素，将其中值等价于给定值的元素赋值为新的值             |
| replace_copy_if                      | 拷贝一个范围的元素，将其中值满足给定条件的元素赋值为新的值             |
| replace_if                           | 将一个范围中值满足给定条件的元素赋值为新的值                           |
| **reverse(first, last)**             | 反转指定序列[first, last)                                              |
| **reverse_copy(first, last, begin)** | 将指定序列[first, last)对应反转序列，拷贝到以begin开始的序列内         |
| rotate                               | 循环移动指定范围中的元素                                               |
| rotate_copy                          | 拷贝指定范围的循环移动结果                                             |
| shuffleC++11                         | 用指定的随机数引擎随机打乱指定范围中的元素的位置                       |
| swap                                 | 交换两个对象的值                                                       |
| swap_ranges                          | 交换两个范围的元素                                                     |
| transform                            | 对指定范围中的每个元素调用某个函数以改变元素的值                       |
| unique                               | 删除指定范围中的所有连续重复元素，仅仅留下每组等值元素中的第一个元素。 |
| unique_copy                          | 拷贝指定范围的唯一化（参考上述的 unique）结果                          |

| 划分函数             | 说明                                          |
| -------------------- | --------------------------------------------- |
| is_partitionedC++11  | 检测某个范围是否按指定谓词（Predicate）划分过 |
| partition            | 将某个范围划分为两组                          |
| partition_copyC++11  | 拷贝指定范围的划分结果                        |
| partition_pointC++11 | 返回被划分范围的划分点                        |
| stable_partition     | 稳定划分，两组元素各维持相对顺序              |

| 排序函数                  | 说明                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| is_sortedC++11            | 检测指定范围是否已排序                                               |
| is_sorted_untilC++11      | 返回最大已排序子范围                                                 |
| nth_element               | 部份排序指定范围中的元素，使得范围按给定位置处的元素划分             |
| partial_sort              | 部份排序                                                             |
| partial_sort_copy         | 拷贝部分排序的结果                                                   |
| **sort(begin, end, cmp)** | 将序列[begin, end)以cmp的方式排序，cmp返回为序列元素间比较提供布尔值 |
| stable_sort               | 稳定排序                                                             |


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

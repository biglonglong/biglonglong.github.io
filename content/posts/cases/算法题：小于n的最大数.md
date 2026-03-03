---
draft: false

title: "算法题：小于n的最大数"
date: 2026-03-03
author: ["biglonglong"]

tags: ["algorithm", "bytedance", "interview"]
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



## 问题描述

给定一个数n（如23121）和一组数字A（如{2,4,9}），求由A中元素组成的、小于n的最大数。

例如：
- n = 23121, A = {2,4,9} → 结果为 22999
- n = 2533, A = {1,2,4,9} → 结果为 2499
- n = 988822, A = {4,2,9,8} → 结果为 988499
- n = 9, A = {9,8} → 结果为 8
- n = 56449, A = {9,6,3,5} → 结果为 56399



## 解题思路

这道题本质上是一个数字组合问题，需要在给定数字集合中选出数字组成一个小于目标数n的最大数。关键点在于：

1. **数字可重复使用**：题目没有说明不能重复使用，从示例22999可以看出是可以重复的
2. **需要小于n**：不能等于n
3. **位数可以不同**：当无法组成与n相同位数的数时，可以退而求其次，组成位数少一位的最大数（全部用最大数字填充）

### 算法设计

采用回溯法（Backtracking）来解决：

1. 将目标数n转为字符串，方便逐位处理
2. 将可用数字排序，便于选择
3. 从最高位开始，逐位尝试放置数字
4. 维护一个标志位表示之前的所有位是否都与n的前缀相等
5. 如果之前的前缀已经小于n，后面可以直接放最大数字
6. 如果之前的前缀等于n，当前位需要选择小于等于当前位的数字
7. 如果无法找到合适的数字，回溯到上一位

### 代码实现

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

string res;

bool backtrack(const string &n_str, const vector<int> &digits, int index, bool equalPrefix)
{
    // 到达末尾，返回是否找到了小于n的数
    if (index == n_str.length())
    {
        return !equalPrefix;
    }

    // 如果前缀已经小于n，后面直接放最大数字
    if (!equalPrefix)
    {
        res += char(digits.back() + '0');
        backtrack(n_str, digits, index + 1, false);
        return true;
    }
    else
    {
        int cur_digit = n_str[index] - '0';
        // 从大到小尝试可能的数字
        for (int i = digits.size() - 1; i >= 0; i--)
        {
            if (digits[i] <= cur_digit)
            {
                res += char(digits[i] + '0');
                bool nextEqual = (digits[i] == cur_digit);
                if (backtrack(n_str, digits, index + 1, nextEqual))
                {
                    return true;
                }
                res.pop_back(); // 回溯
            }
        }
        return false;
    }
}

int maxLessThanN(int n, vector<int> digits)
{
    string n_str = to_string(n);
    sort(digits.begin(), digits.end());
    
    res = "";
    backtrack(n_str, digits, 0, true);
    
    // 如果没找到，构造位数少一位的最大数
    if (res.empty())
    {
        if (n_str.length() > 1)
        {
            string result(n_str.length() - 1, char(digits.back() + '0'));
            return stoi(result);
        }
        return -1; // n为个位数且没有合适的数字
    }
    return stoi(res);
}
```

### 测试用例

```cpp
int main()
{
    vector<pair<int, vector<int>>> test_cases = {
        {23121, {2, 4, 9}},
        {2533, {1, 2, 4, 9}},
        {988822, {4, 2, 9, 8}},
        {11, {9, 8}},
        {333, {9, 8}},
        {56449, {9, 6, 3, 5}}};

    for (const auto &test : test_cases)
    {
        int n = test.first;
        const vector<int> &digits = test.second;
        int result = maxLessThanN(n, digits);
        cout << "n = " << n << ", A = {";
        for (size_t i = 0; i < digits.size(); i++) {
            cout << digits[i];
            if (i < digits.size() - 1) cout << ", ";
        }
        cout << "} → " << result << endl;
    }
    return 0;
}
```

### 运行结果

```
n = 23121, A = {2, 4, 9} → 22999
n = 2533, A = {1, 2, 4, 9} → 2499
n = 988822, A = {4, 2, 9, 8} → 988499
n = 11, A = {9, 8} → 9
n = 333, A = {9, 8} → 99
n = 56449, A = {9, 6, 3, 5} → 56399
```



## 算法分析

- **时间复杂度**：O(m * k)，其中m是n的位数，k是可用数字的个数。最坏情况下需要回溯，但每个位置最多尝试k次。
- **空间复杂度**：O(m)，递归栈的深度。



## 关键点总结

1. **回溯策略**：当遇到无法继续的情况时，需要回退到上一位尝试更小的数字
2. **前缀相等标志**：通过equalPrefix标志来跟踪当前构造的数与目标数的前缀关系
3. **位数降级**：当无法构造出与n相同位数的数时，自动降级到少一位的最大数
4. **贪心选择**：在每个位置上，优先尝试最大的可能数字，这样能保证找到的数最大



## 扩展思考

- 如果数字集合中的数字不能重复使用，该如何修改？
- 如果需要找到大于n的最小数，算法该如何调整？

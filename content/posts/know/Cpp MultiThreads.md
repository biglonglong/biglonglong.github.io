---
draft: false

title: "Cpp MultiThreads"
description: "Cpp 的多线程编程"
date: 2025-02-17
author: ["biglonglong"]

tags: ["summary", "multi threads", "cpp"]
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

## 前言

多线程相关操作，Linux选择使用的是POSIX标准，而Windows自己搞了一套系统调用，称为Win32 API，意味着Linux与Windows存在标准差异，直接导致能在Linux中运行的程序未必能在Windows中运行。

C++11之前，编写多线程相关代码为保证兼容性，需要借助条件编译，分别实现两份代码，根据不同平台编译不同的代码，非常麻烦。

```cpp
// 确保平台兼容性
#ifdef __WIN_32__
	CreateThread // Windows 中创建线程的接口
	// ...
#else
	pthread_create // Linux 中创建线程的接口
	// ...
#endif
```

C++11中加入了线程库标准，其中包含了线程、互斥锁、条件变量等常用线程操作，不需要依赖第三方库，保障了代码的可移植性。除此之外，线程库还新加入了原子相关操作。 

### 线程与进程

- 进程：是操作系统进行资源分配和调度的一个独立单位，是应用程序运行的实例。每个进程都有自己的独立内存空间。
- 线程：是进程中的执行单元，多个线程共享同一进程的内存空间和资源，但**每个线程有自己的栈、程序计数器**等。线程是CPU调度的基本单位。

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E8%BF%9B%E7%A8%8B%E4%B8%8E%E7%BA%BF%E7%A8%8B.png" alt="线程与进程" style="zoom: 67%;" />

### 并发与并行

- 并发：在同一时间间隔发生，并发是针对单核 CPU 提出的，在同一CPU上的多个事件。
- 并行：是指两个或者多个事件在同一时刻发生，并行则是针对多核 CPU 提出，在不同CPU上的多个事件。

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/%E5%B9%B6%E8%A1%8C%E4%B8%8E%E5%B9%B6%E5%8F%91.png" alt="并发与并行" style="zoom: 50%;" />

多线程是实现并发|并行的手段。一般而言，多线程就是把执行一件事情的完整步骤拆分为多个子步骤，然后使得这多个步骤同时执行。

### 同步和互斥

- 线程同步是指多个线程按照一定规律协调工作，使得这些线程在空间、时间上按照既定规律有序地执行工作。实现方式一般有：互斥量（Mutex）、信号量（Semaphore）、事件（Event）、条件变量（Condition Variable）
- 线程互斥是指在多线程环境下，所有线程都要访问共享资源，但同一时刻只能有一个线程访问。实现方式一般有：互斥量（Mutex）、信号量（Semaphore）



## 线程

线程库：`#include <thread>`，先创建线程对象，可以关联一个线程，用来控制该线程以及获取线程的状态。 

### 线程对象构造

#### 无参构造

创建无实际线程关联的对象。后续需要让该线程对象与线程函数关联时，可以以带参的方式创建一个匿名对象，然后调用移动赋值将该匿名对象关联线程的状态转移给该线程对象。

```cpp
thread t1;
//... 
t1 = thread(func, 10);
// 线程启动后，在线程对象销毁前，等待启动的线程完成，才会继续往下执行
t1.join();
```

#### 带可变参数包的构造

支持函数模板的可变参数，包括函数指针、函数对象、lambda表达式。该构造函数其实就是一个模板函数`template <class Fn, class... Args> explicit thread (Fn&& fn, Args&&... args)`。

```cpp
// 自定义函数
void func1(int start, int end) {
	for (int i = start; i <= end; i++)
		cout << i << " "; 
}

// 仿函数
struct My_class {
	void operator()(int start, int end) {
		for (int i = start; i <= end; i++) 
			cout << i << " "; 
	}
};

thread t1(func1, 1, 10);
Sleep(1);
thread t2(My_class(), 10, 20);
Sleep(1);
thread t3([](const string& str) ->void {cout << str << endl; }, "I am thread-3");
Sleep(1);
t1.join();
t2.join();
t3.join();
```

#### 移动构造

能够用一个右值线程对象来移动构造一个线程对象。不允许拷贝构造和拷贝赋值。

```cpp
// 创建匿名函数对象，赋值给 t1
thread t1 = thread(func, 4, 20); 
// 显式move
thread t4(std::move(thread(func, 10, 20))); 
```

### 线程对象成员函数

| 成员函数                 | 功能                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| join                     | 等待一个线程完成，如果该线程还未执行完毕，则主线程将被**阻塞**，直到该线程执行完成，主线程才会继续执行。                                                               |
| joinable                 | 判断线程是否有效或是否可以执行`join()`函数，以下情况线程无效：无参构造函数构造的线程对象、线程对象的状态已经转移给其他线程对象、线程已经调用 join 或 detach 结束。     |
| detach                   | 将当前线程与创建的线程分离，使它们分别运行，当分离的线程执行完毕后，系统会自动回收其资源。如果一个线程被分离了，就不能再使用`join()`函数了，因为线程已经无法被联接了。 |
| this_thread::get_id      | 获取该线程的 id；当前线程id可以使用                                                                                                                                    |
| this_thread::sleep_for   | 当前线程休眠一个时间段，单位包含于 `chrono` 类中                                                                                                                       |
| this_thread::sleep_until | 当前线程休眠到一个具体的时间                                                                                                                                           |
| this_thread::yield       | 当前线程“放弃”执行，让操作系统调度另一个线程继续执行； 主动让出当前线程的时间片，避免大量重复原子尝试操作，把 CPU 资源让出去，从而提高整体效率                         |
| swap                     | 将两个线程对象关联线程的状态进行交换                                                                                                                                   |

### 线程参数

线程函数的参数是以值拷贝的方式拷贝到线程栈空间中的，就算线程函数的参数为引用类型，在线程函数中修改后也不会影响到外部实参，因为其实际引用的是线程栈中的拷贝，而不是外部实参。

如果要通过线程函数的形参改变外部实参，参考如下：

```cpp
//借助std::ref()函数
thread t1(ThreadFunc1, std::ref(a));
t1.join();
// 地址拷贝
thread t2(ThreadFunc1, &a);
t2.join();
// lambda表达式，在捕捉列表中添加a的引用
thread t3([&a] {a += 10;});
t3.join();
```



## 锁

互斥量库：`#include <mutex>`，多个线程可以同时访问和操作共享资源。但当多个线程同时读写这些共享资源（多为全局变量）时，可能会产生数据不一致或冲突的情况。

锁是一种机制，用来确保在同一时刻只有一个线程可以访问共享资源。

加锁一方面要考虑并行化执行，另一方面要考虑其带来的相对复杂性。

### mutex锁

mutex对象之间不能进行拷贝，也不能进行移动，不允许被剥夺的。

| 成员函数 | 功能                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| lock     | 对互斥量进行加锁                                                                                                |
| try_lock | 尝试对互斥量进行加锁，未上锁返回false，并锁住；其他线程已经上锁，返回true；同一个线程已经对它上锁，将会产生死锁 |
| unlock   | 对互斥量进行解锁，释放互斥量的所有权                                                                            |

```cpp
int g_val = 0; // 全局共享资源
 
// 互斥锁对象
mutex mtx;

void Func(int n) {
	while (n--) {
		mtx.lock(); // 加锁
		g_val++;
		mtx.unlock();// 解锁
	}
}

int main() {
	int n = 20000;
	thread t1(Func, n);
	thread t2(Func, n);

	t1.join();
	t2.join();
	cout << "g_val: " << g_val << endl;
	return 0;
}
```

### 其他锁

-  `recursive_mutex mtx;`解决mutex锁在递归时，可能导致死锁的问题，`recursive_mutex`使得自己在持有锁时，不必再申请锁
- `timed_mutex mtx;`新增定时解锁的功能，其中的 `try_lock_for` 是按照相对时间进行自动解锁，`try_lock_until`则是按照绝对时间进行自动解锁
- `recursive_timed_mutex mtx;`是预防递归死锁的时间互斥锁

### ==RAll风格锁==

手动加锁不方便，异常处理使锁资源未释放而导致其他线程死锁。所以要实现锁资源的自动加锁和解锁。

```cpp
mutex mtx;

void dangerousFunction(int id) {
    // 手动加锁
    mtx.lock();
    
    cout << "Thread " << id << " is running." << endl;
    // 模拟一个异常情况，没有解锁就退出
    if (id == 1) {
        throw runtime_error("Thread 1 encountered an error!");
    }
    
    // 手动解锁（如果有异常发生，这行代码不会执行）
    mtx.unlock();
}

int main() {
    try {
        thread t1(dangerousFunction, 1);
        thread t2(dangerousFunction, 2);
 
        t1.join();
        t2.join();
    } catch (const exception &e) {
        cerr << "Exception caught: " << e.what() << endl;
    }

    return 0;
}
```

####  lock_guard

通过栈上的对象实现，适用于在局部范围内锁定互斥量

```cpp
mutex mtx;  // 互斥量
 
void thread_function() {
    lock_guard<mutex> lock(mtx);  // 加锁互斥量
    cout << "Thread running" << endl;
    // 执行需要加锁保护的代码
}  // lock_guard对象的析构函数自动解锁互斥量
 
int main() {
    thread t1(thread_function);
    t1.join();
    cout << "Main thread exits!" << endl;
    return 0;
}
```

#### unique_lock

可以在需要时手动加锁和解锁互斥量，允许在不同代码块中对互斥量进行多次加锁和解锁操作。支持延迟加锁，可以在不立即加锁的情况下创建对象，稍后根据需要进行加锁操作。可以与条件变量一起使用，实现更复杂的线程同步和等待机制。

```cpp
mutex mtx;  // 互斥量
 
void thread_function() {
    unique_lock<mutex> lock(mtx);  // 加锁互斥量
    cout << "Thread running" << endl;
    // 执行需要加锁保护的代码
    lock.unlock();  // 手动解锁互斥量
    // 执行不需要加锁保护的代码
    lock.lock();  // 再次加锁互斥量
    // 执行需要加锁保护的代码
}  
// unique_lock对象的析构函数自动解锁互斥量
 
int main() {
    thread t1(thread_function);
    t1.join();
    cout << "Main thread exits!" << endl;
    return 0;
}
```



## 条件变量

条件变量库：`#include <condition_variable>`、`#include <condition_variable_any>` ，实现线程间的条件变量和线程同步，它提供了**等待**和**通知**的机制，使得线程可以等待某个条件成立时被唤醒，或者在满足某个条件时通知其他等待的线程。其提供了以下几个函数用于等待和通知线程： 

| 方法       | 说明                                                                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wait       | 使当前线程进入等待状态（阻塞），直到被其他线程通过`notify_one()`或`notify_all()`函数唤醒。该函数需要一个互斥锁作为参数，调用时会自动释放互斥锁，并在被唤醒后重新获取互斥锁                                                                                |
| wait_for   | 使当前线程进入等待状态，直到被其他线程通过`notify_one()`或`notify_all()`函数唤醒，或者等待超时。该函数需要一个互斥锁和一个时间段作为参数，返回时有两种情况：等待超时返回std::cv_status::timeout，被唤醒返回std::cv_status::no_timeout                     |
| wait_until | 使当前线程进入等待状态，直到被其他线程通过notify_one()或notify_all()函数唤醒，或者等待时间达到指定的绝对时间点。该函数需要一个互斥锁和一个绝对时间点作为参数，返回时有两种情况：时间到达返回std::cv_status::timeout，被唤醒返回std::cv_status::no_timeout |
| notify_one | 唤醒一个等待中的线程，如果有多个线程在等待，则选择其中一个线程唤醒                                                                                                                                                                                        |
| notify_all | 唤醒所有等待中的线程，使它们从等待状态返回                                                                                                                                                                                                                |

```cpp
// 定义共享变量和相关的同步工具
int count = 0; // 计数器
mutex mtx; // 互斥锁
condition_variable cv; // 条件变量

// 增加计数的线程函数
void increment() {
    for (int i = 0; i < 5; ++i) {
        this_thread::sleep_for(chrono::milliseconds(100)); // 模拟工作
        unique_lock<mutex> lock(mtx); // 使用 unique_lock
        count++; // 增加计数
        cout << "计数增加到: " << count << endl;
        cv.notify_one(); // 通知其他线程
    }
}
 
// 打印计数的线程函数
void print() {
    for (int i = 0; i < 5; ++i) {
        unique_lock<mutex> lock(mtx); // 加锁
        cv.wait(lock); // 等待通知
        cout << "当前计数是: " << count << endl; // 打印计数
    }
}
 
int main() {
    thread t1(increment); // 创建增加计数的线程
    thread t2(print); // 创建打印计数的线程
 
    t1.join(); // 等待线程完成
    t2.join();
 
    return 0;
}
```

用C++实现两个线程交替打印一个1-100的奇偶数字

```cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
 
// 定义共享变量
int number = 1; // 当前要打印的数字
std::mutex mtx; // 互斥锁
std::condition_variable cv; // 条件变量
 
// 打印奇数的线程函数
void printOdd() {
    while (number <= 100) {
        std::unique_lock<std::mutex> lock(mtx); // 加锁
        // 等待直到当前数字是奇数
        cv.wait(lock, [] { return number % 2 != 0; }); 
        if (number <= 100) {
            std::cout << number << " "; // 打印奇数
            number++; // 增加数字
        }
        cv.notify_all(); // 通知另一个线程
    }
}
 
// 打印偶数的线程函数
void printEven() {
    while (number <= 100) {
        std::unique_lock<std::mutex> lock(mtx); // 加锁
        // 等待直到当前数字是偶数
        cv.wait(lock, [] { return number % 2 == 0; }); 
        if (number <= 100) {
            std::cout << number << " "; // 打印偶数
            number++; // 增加数字
        }
        cv.notify_all(); // 通知另一个线程
    }
}
 
int main() {
    // 创建线程，分别负责打印奇数和偶数
    std::thread oddThread(printOdd); 
    std::thread evenThread(printEven); 
 
    // 等待线程完成
    oddThread.join(); 
    evenThread.join(); 
 
    return 0;
}
```



## 线程池

多线程编程时需要多次的创建并销毁线程，大量内存和时间消耗，同时影响局部性及整体性能。线程池维护着多个线程，这避免了在处理短时间任务时创建与销毁线程的代价。

1. 线程池管理器（ThreadPoolManager）:用于创建并管理线程池，也就是线程池类
2. 工作线程（WorkThread）: 线程池中线程
3. 任务队列（task）: 用于存放没有处理的任务。提供一种缓冲机制。
4. append：用于添加任务的接口

```cpp
#ifndef _THREADPOOL_H
#define _THREADPOOL_H

#include <iostream>
#include <vector>
#include <queue>
#include <thread>
#include <condition_variable>
#include <memory> //unique_ptr
#include <stdexcept>
#include<assert.h>

const int MAX_THREADS = 1000; //最大线程数目
template <typename T>
class threadPool {
public:
    threadPool(int number = 1);	//默认开一个线程
    ~threadPool();
    std::queue<T> tasks_queue; 	//任务队列
    bool append(T *request);	//往请求队列＜task_queue＞中添加任务<T>
private:
    static void *worker(void arg); //工作线程的运行函数
    void run();
private:
    std::vector<std::thread> work_threads; //工作线程
    std::mutex queue_mutex;
    std::condition_variable condition;  //必须与unique_lock配合使用
    bool stop;
};

template <typename T>
threadPool<T>::threadPool(int number) : stop(false) {
    if (number <= 0 || number > MAX_THREADS)
        throw std::exception();
    for (int i = 0; i < number; i++) {
        std::cout << "created Thread num is : " << i <<std::endl;
        work_threads.emplace_back(worker, this);
    }
}
template <typename T>
inline threadPool<T>::~threadPool() {
    std::unique_lock<std::mutex> lock(queue_mutex);
    stop = true;
    condition.notify_all();
    for (auto &w : work_threads)
        w.join();
}

template <typename T>
bool threadPool<T>::append(T *request) {
    queue_mutex.lock();			//操作工作队列时一定要加锁，因为他被所有线程共享
    tasks_queue.push(request);
    queue_mutex.unlock();
    condition.notify_one();  	//线程池添加进去了任务，自然要通知等待的线程
    return true;
}

template <typename T>
void threadPool<T>::worker(void *arg) {
    threadPool pool = (threadPool *)arg;
    pool->run();
    return;
}
template <typename T>
void threadPool<T>::run() {
	while (!stop) {
   		std::unique_lock<std::mutex> lock1(this->queue_mutex);
    	this->condition.wait(lock1, [this]{return !this->tasks_queue.empty(); });
    	if (this->tasks_queue.empty()) { 
            assert(0&&"断了");//实际上不会运行到这一步，因为任务为空，wait就休眠了。
            continue;
    	}
        else {
            T *request = tasks_queue.front();
            tasks_queue.pop();
            if (request) request->process();
        }
    }
}
#endif
```

```cpp
#include "mythread.h"
#include<string>
#include<math.h>
using namespace std;
class Task {
public:
    void process() {
        //cout << "run........." << endl;
        //...
    }
};

int main(void){
    threadPool<Task> pool(6);
    while (1){
        Task *tt = new Task();
        pool.append(tt);
        delete tt;
    }
}
```



## 异步调用



## 原子操作


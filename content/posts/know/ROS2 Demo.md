---
draft: false

title: "ROS2 Demo"
description: "机器人开发套件 ROS2 的理论与实践"
date: 2024-12-13
author: ["biglonglong"]

tags: ["summary", "ros2", "cpp", "python"]
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


## 文件系统

```txt
WorkSpace --- 自定义的工作空间。
    |--- build：存储中间文件的目录，该目录下会为每一个功能包创建一个单独子目录。
    |--- install：安装目录，该目录下会为每一个功能包创建一个单独子目录。
    |--- log：日志目录，用于存储日志文件。
    |--- src：用于存储功能包源码的目录。
        |-- C++功能包
            |-- package.xml：包信息，比如:包名、版本、作者、依赖项。
            |-- CMakeLists.txt：配置编译规则，比如源文件、依赖项、目标文件。
            |-- src：C++源文件目录。
            |-- include：头文件目录。
            |-- msg：消息接口文件目录。
            |-- srv：服务接口文件目录。
            |-- action：动作接口文件目录。
        |-- Python功能包
            |-- package.xml：包信息，比如:包名、版本、作者、依赖项。
            |-- setup.py：与C++功能包的CMakeLists.txt类似。
            |-- setup.cfg：功能包基本配置文件。
            |-- resource：资源目录。
            |-- test：存储测试相关文件。
            |-- 功能包同名目录：Python源文件目录。
		  --------------------------------------------
		  |-- C++或Python功能包
            |-- launch：存储launch文件。
            |-- rviz：存储rviz2配置相关文件。
            |-- urdf：存储机器人建模文件。
            |-- params：存储参数文件。
            |-- world：存储仿真环境相关文件。
            |-- map：存储导航所需地图文件。
            |-- ......
```



## 流程

1. 创建工作空间

   ```bash
   mkdir -p [workspace_name]/src
   cd [workspace_name]
   colcon build
   # build、install、log、src belong to [workspace_name]
   ```

2. 创建功能包

   ```bash
   cd [workspace_name]/src
   ros2 pkg create [package_name] --build-type [ament_cmake|ament_python] --dependencies [rclcpp|rclpy&...] <--node-name [program_name]>
   # [program_name] belong to [workspace_name]/src
   ```
   
3. 编辑源文件，`python` 和`cpp`二选一

   ```cpptext
   cd [package_name]/src
   vim [program_name].cpp
   ```

   ```pytext
   cd [package_name]/[package_name]
   vim [program_name].py
   ```

4. 编辑配置文件

   - `package.xml`：为colcon构建工具确定功能包的编译顺序，例如

     ```xml
     <!---添加所需依赖--->
     <depend>rclcpp</depend>
     ```

     - cpp修改`CMakeLists.txt`：例如

     
     ```txt
     # 引入外部依赖包
     find_package(rclcpp REQUIRED)
     # 映射源文件与可执行文件
     add_executable([program_name] src/[program_name].cpp)
     # 设置目标依赖库
     ament_target_dependencies(
       [program_name]
       "rclcpp"
     )
     
     # 定义安装规则
     install(TARGETS [program_name]
       DESTINATION lib/${PROJECT_NAME})
     ```
     
     - py修改`setup.py`，例如
     
     
     ```py
     entry_points={
         'console_scripts': [
             # 映射源文件与可执行文件
             '[program_name] = [package_name].[program_name]:main'
         ],
     },
     ```

5. 编译运行

   ```bash
   cd [workspace_name]
   colcon build <--packages-select [package_name]>
   source ./install/setup.bash
   ros2 run [package_name] [program_name] <[argv]>
   ```



## 通信

通信对象的构建依赖于**节点**，每个节点对应某单一**功能模块**，单个**可执行文件**可以包含多个节点，具有相同**话题**的节点可以关联**通信**

### 模板

> bug：检查cpp、py、package.xml、CMakeLists.txt、`colcon build`、`source ./install/setup.bash`
>

```cpp
#include "rclcpp/rclcpp.hpp"

class MyNode: public rclcpp::Node{
public:
    MyNode():Node("node_name"){
        RCLCPP_INFO(this->get_logger(),"demo print");
    }

};
int main(int argc, char *argv[]) {
    // init Context()
    rclcpp::init(argc,argv);
    auto node = std::make_shared<MyNode>();
    // free Context()
    rclcpp::shutdown();
    return 0;
}
```

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__("node_name")
        self.get_logger().info("demo print")
def main():
    # init Context()
    rclpy.init()
    node = MyNode() 
    # free Context()
    rclpy.shutdown()
```

### 话题

> msg接口|基于广播的话题模式|一般应用于不断更新的、少逻辑处理的数据传输场景

```msg
int32 num1
int32 num2
# modify package.xml & CamkeLists.txt...
```

```cpp
#include "rclcpp/rclcpp.hpp"
#include "base_interface/msg/nums.hpp"

using namespace std::chrono_literals;
using base_interface::msg::Nums;

class PublishClass : public rclcpp::Node {
    public:
        PublishClass() : Node("publish_node"), count_(0) {
            RCLCPP_INFO(this->get_logger(), "publish start...");
            publisher_ = this->create_publisher<Nums>("add", 10);
            timer_ = this->create_wall_timer(500ms, std::bind(&PublishClass::timer_callback, this));
        }
    private:
        void timer_callback() {
            auto message = Nums();
            message.num1 = count_;
            message.num2 = count_;
            count_++;
            RCLCPP_INFO(this->get_logger(), "publish:%d + %d", message.num1, message.num2);
            publisher_->publish(message);
        }
        
        rclcpp::TimerBase::SharedPtr timer_;
        rclcpp::Publisher<Nums>::SharedPtr publisher_;
        size_t count_;
};

int main(int argc, char * argv[]) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<PublishClass>());
    rclcpp::shutdown();
    return 0;
}
----------------------------------------------------------------------
#include "rclcpp/rclcpp.hpp"
#include "base_interface/msg/nums.hpp"

using std::placeholders::_1;
using base_interface::msg::Nums;

class SubscribeClass : public rclcpp::Node {
    public:
        SubscribeClass() : Node("subscribe_node") {
            RCLCPP_INFO(this->get_logger(), "subscribe start...");
            subscriber_ = this->create_subscription<Nums>("add", 10, std::bind(&SubscribeClass::topic_callback, this, _1));
        }
    private:
        void topic_callback(const Nums & msg) const {
            RCLCPP_INFO(this->get_logger(), "subscribe: %d & %d, sum is %d", msg.num1, msg.num2, msg.num1+msg.num2);
        }

        rclcpp::Subscription<Nums>::SharedPtr subscriber_;
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<SubscribeClass>());
    rclcpp::shutdown();
    return 0;
}
```

```python
import rclpy
from rclpy.node import Node
from base_interface.msg import Nums

class PublishClass(Node):
    def __init__(self):
        super().__init__("publish_node")
        self.get_logger().info("publish start...")
        self.publisher_ = self.create_publisher(Nums, "add", 10)
        self.timer = self.create_timer(0.5, self.timer_callback)
        self.count = 0
    
    def timer_callback(self):
        msg = Nums()
        msg.num1 = self.count
        msg.num2 = self.count
        self.count+=1
        self.get_logger().info("publish:%d + %d" % (msg.num1, msg.num2))
        self.publisher_.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    publisher = PublishClass()
    rclpy.spin(publisher)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
----------------------------------------------------------------------
import rclpy
from rclpy.node import Node
from base_interface.msg import Nums

class SubscribeClass(Node):
    def __init__(self):
        super().__init__('subscriber_node')
        self.get_logger().info("subscribe start...")
        self.subscriber = self.create_subscription(Nums, 'add', self.topic_callback, 10)

    def topic_callback(self, msg):
        self.get_logger().info('subscribe: %d & %d, sum is %d' % (msg.num1, msg.num2, msg.num1+msg.num2))

def main(args=None):
    rclpy.init(args=args)
    subscriber = SubscribeClass()
    rclpy.spin(subscriber)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 服务

> srv接口|基于请求响应的服务模式|一般应用于偶然的、对实时性有要求、有一定逻辑处理需求的数据传输场景

```srv
int32 num1
int32 num2
---
int32 sum
# modify package.xml & CamkeLists.txt...
```

```cpp
#include "rclcpp/rclcpp.hpp"
#include "base_interface/srv/add_ints.hpp"

using namespace std::chrono_literals;
using base_interface::srv::AddInts;

class PublishClass : public rclcpp::Node {
    public:
        PublishClass() : Node("publish_node") {
            RCLCPP_INFO(this->get_logger(), "publish start...");
            client_ = this->create_client<AddInts>("add");
        }
        bool connect_server() {
            while (!client_->wait_for_service(5s)) {
                if (!rclcpp::ok()) {
                    RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"while bug!");
                    return false;
                }
                RCLCPP_INFO(this->get_logger(),"in connect...");
            }
            return true;
        }
        rclcpp::Client<AddInts>::FutureAndRequestId send_request(int32_t num1, int32_t num2){
            auto request = std::make_shared<AddInts::Request>();
            request->num1 = num1;
            request->num2 = num2;
            return client_->async_send_request(request);
        }
    private:
        rclcpp::Client<AddInts>::SharedPtr client_;
};

int main(int argc, char * argv[]) {
    if(argc != 3) {
        RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"only need two numbers!");
        return 1;
    }

    rclcpp::init(argc, argv);
    auto client = std::make_shared<PublishClass>();
    bool flag = client->connect_server();
    if(!flag) {
        RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"connect failed!");
        return 0;
    }

    auto response = client->send_request(atoi(argv[1]),atoi(argv[2]));
    if (rclcpp::spin_until_future_complete(client,response) == rclcpp::FutureReturnCode::SUCCESS) {
        RCLCPP_INFO(client->get_logger(),"deal success");
        RCLCPP_INFO(client->get_logger(),"sum is %d", response.get()->sum);
    } else {
        RCLCPP_INFO(client->get_logger(),"fail response");
    }

    rclcpp::shutdown();
    return 0;
}
----------------------------------------------------------------------
#include "rclcpp/rclcpp.hpp"
#include "base_interface/srv/add_ints.hpp"

using std::placeholders::_1;
using std::placeholders::_2;
using base_interface::srv::AddInts;

class SubscribeClass : public rclcpp::Node {
    public:
        SubscribeClass() : Node("subscribe_node") {
            RCLCPP_INFO(this->get_logger(), "subscribe start...");
            server_ = this->create_service<AddInts>("add",std::bind(&SubscribeClass::topic_callback, this, _1, _2));
        }
    private:
        void topic_callback(const AddInts::Request::SharedPtr req,const AddInts::Response::SharedPtr res){
            res->sum = req->num1 + req->num2;
            RCLCPP_INFO(this->get_logger(),"subscribe:(%d,%d), sum is %d", req->num1, req->num2, res->sum);
        }
        rclcpp::Service<AddInts>::SharedPtr server_;
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    auto server = std::make_shared<SubscribeClass>();
    rclcpp::spin(server);
    rclcpp::shutdown();
    return 0;
}
```

```python
import sys
import rclpy
from rclpy.node import Node
from base_interface.srv import AddInts

class PublishClass(Node):
    def __init__(self):
        super().__init__("publish_node")
        self.get_logger().info("publish start...")
        self.client_ = self.create_client(AddInts, 'add')
        while not self.client_.wait_for_service(timeout_sec=3.0):
            self.get_logger().info('in connect...')
        self.req = AddInts.Request()

    def send_request(self):
        self.req.num1 = int(sys.argv[1])
        self.req.num2 = int(sys.argv[2])
        self.future = self.client_.call_async(self.req)

def main():
    logger = rclpy.logging.get_logger('my_logger')
    if len(sys.argv) != 3:
        logger.info('only need two numbers!')
        sys.exit(1)
    
    rclpy.init()
    client = PublishClass()
    client.send_request()
    rclpy.spin_until_future_complete(client,client.future)

    try:
        response = client.future.result()
    except Exception as e:
        client.get_logger().info('fail response: %r' % (e,))
    else:
        client.get_logger().info('sum is: %d + %d = %d' %
            (client.req.num1, client.req.num2, response.sum))

    rclpy.shutdown()

if __name__ == '__main__':
    main()
----------------------------------------------------------------------
import rclpy
from rclpy.node import Node
from base_interface.srv import AddInts

class SubscribeClass(Node):
    def __init__(self):
        super().__init__('subscriber_node')
        self.get_logger().info("subscribe start...")
        self.server_ = self.create_service(AddInts, 'add', self.topic_callback)

    def topic_callback(self, request, response):
        response.sum = request.num1 + request.num2
        self.get_logger().info('subscribe:(%d,%d), sum is %d' % (request.num1, request.num2, response.sum))
        return response

def main(args=None):
    rclpy.init(args=args)
    server = SubscribeClass()
    rclpy.spin(server)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 动作

> action接口|连续反馈的服务模式|一般适用于耗时的请求响应场景，用以获取连续的状态反馈

```action
int64 num
---
int64 sum
---
float64 progress
```

```cpp
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "base_interface/action/progress.hpp"

using namespace std::placeholders;
using base_interface::action::Progress;
using GoalHandleProgress = rclcpp_action::ClientGoalHandle<Progress>;

class PublishClass : public rclcpp::Node {
    public:
        explicit PublishClass(const rclcpp::NodeOptions & options = rclcpp::NodeOptions())
        : Node("publish_node", options) {
            RCLCPP_INFO(this->get_logger(), "publish start...");
            this->client_ = rclcpp_action::create_client<Progress>(this,"add");
        }

        void send_goal(int64_t num) {
            if(!this->client_) {
                RCLCPP_ERROR(this->get_logger(), "client haven't inited");
            }
            if (!this->client_->wait_for_action_server(std::chrono::seconds(10))) {
                RCLCPP_ERROR(this->get_logger(), "connect actioner error!");
                return;
            }

            auto goal_msg = Progress::Goal();
            goal_msg.num = num;
            auto send_goal_options = rclcpp_action::Client<Progress>::SendGoalOptions();
            send_goal_options.goal_response_callback =std::bind(&PublishClass::goal_response_callback, this, _1);
            send_goal_options.feedback_callback =std::bind(&PublishClass::feedback_callback, this, _1, _2);
            send_goal_options.result_callback =std::bind(&PublishClass::result_callback, this, _1);
            
            auto goal_handle_future = this->client_->async_send_goal(goal_msg, send_goal_options);
        }
    private:
        void goal_response_callback(GoalHandleProgress::SharedPtr goal_handle) {
            if (!goal_handle) {
            RCLCPP_ERROR(this->get_logger(), "Goal::REJECT");
            } 
            else {
            RCLCPP_INFO(this->get_logger(), "Goal::ACCEPT_AND_EXECUTE");
            }
        }

        void feedback_callback(GoalHandleProgress::SharedPtr goal_handle,const std::shared_ptr<const Progress::Feedback> feedback) {
            (void) goal_handle;
            int32_t progress = (int32_t)(feedback->progress * 100);
            RCLCPP_INFO(this->get_logger(), "feetback, progess: %d%%", progress);
        }

        void result_callback(const GoalHandleProgress::WrappedResult & result) {
            switch (result.code) {
            case rclcpp_action::ResultCode::SUCCEEDED:
                RCLCPP_INFO(this->get_logger(), "over, res is: %ld", result.result->sum);
                break;
            case rclcpp_action::ResultCode::ABORTED:
                RCLCPP_ERROR(this->get_logger(), "aborted");
                return;
            case rclcpp_action::ResultCode::CANCELED:
                RCLCPP_ERROR(this->get_logger(), "canceled");
                return;
            default:
                RCLCPP_ERROR(this->get_logger(), "other exception");
                return;
            }
        }

        rclcpp_action::Client<Progress>::SharedPtr client_;
};

int main(int argc, char * argv[]) {
    if(argc != 2) {
        RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"only need one number!");
        return 1;
    }

    rclcpp::init(argc, argv);
    auto client = std::make_shared<PublishClass>();
    client->send_goal(atoi(argv[1]));
    rclcpp::spin(client);
    rclcpp::shutdown();
    return 0;
}
----------------------------------------------------------------------
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "base_interface/action/progress.hpp"

using namespace std::placeholders;
using base_interface::action::Progress;
using GoalHandleProgress = rclcpp_action::ServerGoalHandle<Progress>;

class SubscribeClass : public rclcpp::Node {
    public:
        explicit SubscribeClass(const rclcpp::NodeOptions & options = rclcpp::NodeOptions())
        : Node("subscribe_node", options) {
            RCLCPP_INFO(this->get_logger(), "subscribe start...");
            this->actioner_ = rclcpp_action::create_server<Progress>(this, "add",
                std::bind(&SubscribeClass::handle_goal, this, _1, _2),
                std::bind(&SubscribeClass::handle_cancel, this, _1),
                std::bind(&SubscribeClass::handle_accepted, this, _1));
        }
    private:
        rclcpp_action::GoalResponse handle_goal(const rclcpp_action::GoalUUID & uuid,std::shared_ptr<const Progress::Goal> goal) {
            (void)uuid;
            RCLCPP_INFO(this->get_logger(), "subscribe: %ld", goal->num);
            if (goal->num < 1) {
                RCLCPP_INFO(this->get_logger(), "Goal::REJECT");
                return rclcpp_action::GoalResponse::REJECT;
            }
            RCLCPP_INFO(this->get_logger(), "Goal::ACCEPT_AND_EXECUTE");
            return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
        }

        void handle_accepted(const std::shared_ptr<GoalHandleProgress> goal_handle) {
            std::thread{std::bind(&SubscribeClass::execute, this, _1), goal_handle}.detach();
        }

        void execute(const std::shared_ptr<GoalHandleProgress> goal_handle) {
            RCLCPP_INFO(this->get_logger(), "excute:");

            const auto goal = goal_handle->get_goal();
            auto feedback = std::make_shared<Progress::Feedback>();
            auto result = std::make_shared<Progress::Result>();

            int64_t sum= 0;
            rclcpp::Rate loop_rate(1.0);
            for (int i = 1; (i <= goal->num) && rclcpp::ok(); i++) {
                sum += i;

                if (goal_handle->is_canceling()) {
                    result->sum = sum;
                    goal_handle->canceled(result);
                    RCLCPP_INFO(this->get_logger(), "abort!");
                    return;
                }

                feedback->progress = (double_t)i / goal->num;
                goal_handle->publish_feedback(feedback);
                RCLCPP_INFO(this->get_logger(), "feetback, progess:%.2f", feedback->progress);
                loop_rate.sleep();
            }

            if (rclcpp::ok()) {
                result->sum = sum;
                goal_handle->succeed(result);
                RCLCPP_INFO(this->get_logger(), "over!");
            }
        }

        rclcpp_action::CancelResponse handle_cancel(const std::shared_ptr<GoalHandleProgress> goal_handle) {
            (void)goal_handle;
            RCLCPP_INFO(this->get_logger(), "Cancel::ACCEPT");
            return rclcpp_action::CancelResponse::ACCEPT;
        }

        rclcpp_action::Server<Progress>::SharedPtr actioner_;
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    auto actioner = std::make_shared<SubscribeClass>();
    rclcpp::spin(actioner);
    rclcpp::shutdown();
    return 0;
}
```

```python
import sys
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from base_interface.action import Progress

class PublishClass(Node):
    def __init__(self):
        super().__init__("publish_node")
        self.get_logger().info("publish start...")
        self.client_ = ActionClient(self, Progress, 'add')

    def send_goal(self, num):
        goal_msg = Progress.Goal()
        goal_msg.num = num
        self.client_.wait_for_server()
        self._send_goal_future = self.client_.send_goal_async(goal_msg, feedback_callback=self.feedback_callback)
        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, send_goal_future):
        goal_handle = send_goal_future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal::REJECT')
            return

        self.get_logger().info('Goal::ACCEPT_AND_EXECUTE')

        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def get_result_callback(self, get_result_future):
        result = get_result_future.result().result
        self.get_logger().info('over, res is: %d' % result.sum)
        rclpy.shutdown()

    def feedback_callback(self, feedback_msg):
        feedback = (int)(feedback_msg.feedback.progress * 100)
        self.get_logger().info('feetback, progess: %d%%' % feedback)

def main():
    logger = rclpy.logging.get_logger('my_logger')
    if len(sys.argv) != 2:
        logger.info('only need one number!')
        sys.exit(1)

    rclpy.init()
    client = PublishClass()
    client.send_goal(sys.argv[1])
    rclpy.spin(client)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
----------------------------------------------------------------------
import time
import rclpy
from rclpy.node import Node
from rclpy.action import ActionServer
from base_interface.action import Progress

class SubscribeClass(Node):
    def __init__(self):
        super().__init__('subscriber_node')
        self.get_logger().info("subscribe start...")
        self.actioner_ = ActionServer(self,Progress,'add',self.topic_callback)

    def topic_callback(self, goal_handle):
        self.get_logger().info('excute:')
        feedback = Progress.Feedback()

        sum = 0
        for i in range(1, goal_handle.request.num + 1):
            sum += i
            feedback.progress = i / goal_handle.request.num
            goal_handle.publish_feedback(feedback)
            self.get_logger().info('feetback, progess: %.2f' % feedback.progress)
            time.sleep(1)

        goal_handle.succeed()
        result = Progress.Result()
        result.sum = sum
        self.get_logger().info('over!')
        return result

def main(args=None):
    rclpy.init(args=args)
    actioner = SubscribeClass()
    rclpy.spin(actioner)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### 参数

> 参数对象（键、值和描述符）|基于请求响应的参数共享模式|一般适用于节点的“全局变量”的概念

```param
# cpp paramObject
// 创建参数对象
rclcpp::Parameter p1("car_name","Tiger"); //参数值为字符串类型
rclcpp::Parameter p2("width",0.15); //参数值为浮点类型
rclcpp::Parameter p3("wheels",2); //参数值为整型

// 获取参数值并转换成相应的数据类型
RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"car_name = %s", p1.as_string().c_str());
RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"width = %.2f", p2.as_double());
RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"wheels = %ld", p3.as_int());

// 获取参数的键
RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"p1 name = %s", p1.get_name().c_str());
// 获取参数数据类型
RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"p1 type_name = %s", p1.get_type_name().c_str());
// 将参数值转换成字符串类型
RCLCPP_INFO(rclcpp::get_logger("rclcpp"),"p1 value_to_msg = %s", p1.value_to_string().c_str());


# py paramObject
# 创建参数对象
p1 = rclpy.Parameter("car_name",value="Horse")
p2 = rclpy.Parameter("length",value=0.5)
p3 = rclpy.Parameter("wheels",value=4)

# 获取参数值
get_logger("rclpy").info("car_name = %s" % p1.value)
get_logger("rclpy").info("length = %.2f" % p2.value)
get_logger("rclpy").info("wheels = %d" % p3.value)

# 获取参数键
get_logger("rclpy").info("p1 name = %s" % p1.name)
```

```cpp
#include "rclcpp/rclcpp.hpp"
using namespace std::chrono_literals;

class PublishClass : public rclcpp::Node {
    public:
        PublishClass() : Node("publish_node") {
            RCLCPP_INFO(this->get_logger(), "publish start...");
            client_ = std::make_shared<rclcpp::SyncParametersClient>(this,"subscribe_node");
        }

        bool connect_server() {
            while (!client_->wait_for_service(5s)) {
                if (!rclcpp::ok()) {
                   return false;
                }  
                RCLCPP_INFO(this->get_logger(),"in connect...");
            }
            return true;
        }

        void get_param(){
            RCLCPP_INFO(this->get_logger(),"get_param");

            // 获取指定
            double height = client_->get_parameter<double>("height");
            RCLCPP_INFO(this->get_logger(),"height = %.2f", height);
            // 判断包含
            RCLCPP_INFO(this->get_logger(),"car_type 存在吗？%d", client_->has_parameter("car_type"));
            // 获取所有
            auto params = client_->get_parameters({"car_type","height","wheels"});
            for (auto &param : params) {
                RCLCPP_INFO(this->get_logger(),"%s = %s", param.get_name().c_str(),param.value_to_string().c_str());
            }
        }

        void update_param(){
            RCLCPP_INFO(this->get_logger(),"update_param");
            client_->set_parameters({rclcpp::Parameter("car_type","Mouse"),
            rclcpp::Parameter("wheels",6),
            rclcpp::Parameter("height",2.0),
            // 只有allow_undeclared_parameters(true)时，这个参数才会被成功设置。
            rclcpp::Parameter("width",0.15)
            });
        }
    private:   
        rclcpp::SyncParametersClient::SharedPtr client_;
};

int main(int argc, char * argv[]) {
    rclcpp::init(argc, argv);

    auto client = std::make_shared<PublishClass>();
    bool flag = client->connect_server();
    if(!flag){
        return 0;
    }
    client->get_param();
    client->update_param();
    client->get_param();
    rclcpp::shutdown();
    return 0;
}
----------------------------------------------------------------------
#include "rclcpp/rclcpp.hpp"

class SubscribeClass : public rclcpp::Node {
    public:
        SubscribeClass() : Node("subscribe_node",rclcpp::NodeOptions().allow_undeclared_parameters(true)) {
          RCLCPP_INFO(this->get_logger(), "subscribe start...");
        }

        void declare_param(){
            RCLCPP_INFO(this->get_logger(), "declare_param");
            
            // 不可删除参数声明
            this->declare_parameter("car_type","Tiger"); 
            this->declare_parameter("height",1.50); 
            this->declare_parameter("wheels",4); 
            // 可删除参数声明
            this->set_parameter(rclcpp::Parameter("undcl_test",100));
        }

        void get_param(){
            RCLCPP_INFO(this->get_logger(), "get_param");

            // 获取指定
            rclcpp::Parameter car_type = this->get_parameter("car_type");
            RCLCPP_INFO(this->get_logger(),"car_type:%s",car_type.as_string().c_str());
            RCLCPP_INFO(this->get_logger(),"height:%.2f",this->get_parameter("height").as_double());
            RCLCPP_INFO(this->get_logger(),"wheels:%ld",this->get_parameter("wheels").as_int());
            RCLCPP_INFO(this->get_logger(),"undcl_test:%ld",this->get_parameter("undcl_test").as_int());
            // 判断包含
            RCLCPP_INFO(this->get_logger(),"包含car_type? %d",this->has_parameter("car_type"));
            RCLCPP_INFO(this->get_logger(),"包含car_typesxxxx? %d",this->has_parameter("car_typexxxx"));
            // 获取所有
            auto params = this->get_parameters({"car_type","height","wheels"});
            for (auto &param : params) {
                RCLCPP_INFO(this->get_logger(),"name = %s, value = %s", param.get_name().c_str(), param.value_to_string().c_str());
            }
        }

        void update_param(){
            RCLCPP_INFO(this->get_logger(), "update_param");

            this->set_parameter(rclcpp::Parameter("height",1.75));
            RCLCPP_INFO(this->get_logger(),"height:%.2f",this->get_parameter("height").as_double());
        }

        void del_param(){
            RCLCPP_INFO(this->get_logger(), "del_param");

            // this->undeclare_parameter("car_type");
            // RCLCPP_INFO(this->get_logger(),"删除操作后，car_type还存在马? %d",this->has_parameter("car_type"));
            RCLCPP_INFO(this->get_logger(),"删除操作前，undcl_test存在马? %d",this->has_parameter("undcl_test"));
            this->undeclare_parameter("undcl_test");
            RCLCPP_INFO(this->get_logger(),"删除操作后，undcl_test存在马? %d",this->has_parameter("undcl_test"));
        }
};

int main(int argc, char *argv[]) {
    rclcpp::init(argc, argv);
    auto paramer= std::make_shared<SubscribeClass>();
    paramer->declare_param();
    paramer->get_param();
    paramer->update_param();
    paramer->del_param();

    rclcpp::spin(paramer);
    rclcpp::shutdown();
    return 0;
}
```

```python
import rclpy
from rclpy.node import Node
from rcl_interfaces.srv import ListParameters
from rcl_interfaces.srv import GetParameters
from rcl_interfaces.srv import SetParameters
from rcl_interfaces.msg import ParameterType
from rcl_interfaces.msg import Parameter
from rcl_interfaces.msg import ParameterValue
from ros2param.api import get_parameter_value

class PublishClass(Node):
    def __init__(self):
        super().__init__("publish_node")
        self.get_logger().info("publish start...")

    def list_params(self):
        client_ = self.create_client(ListParameters, '/subscriber_node/list_parameters')
        while not client_.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('list_params in connect...')
        req = ListParameters.Request()
        future = client_.call_async(req)
        rclpy.spin_until_future_complete(self,future)
        return future.result()

    def get_params(self,names):
        client_ = self.create_client(GetParameters, '/subscriber_node/get_parameters')
        while not client_.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('get_params in connect...')
        req = GetParameters.Request()
        req.names = names
        future = client_.call_async(req)
        rclpy.spin_until_future_complete(self,future)
        return future.result()

    def set_params(self):
        client_ = self.create_client(SetParameters, '/subscriber_node/set_parameters')
        while not client_.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('set_params in connect...')
        req = SetParameters.Request()

        p1 = Parameter()
        p1.name = "car_type"
        p1.value = get_parameter_value(string_value="Pig")

        p2 = Parameter()
        p2.name = "height"
        v2 = ParameterValue()
        v2.type = ParameterType.PARAMETER_DOUBLE
        v2.double_value = 0.3
        p2.value = v2

        req.parameters = [p1, p2]
        future = client_.call_async(req)
        rclpy.spin_until_future_complete(self,future)
        return future.result()

def main(): 
    rclpy.init()
    client = PublishClass()

    client.get_logger().info("list_params")
    response = client.list_params()
    for name in response.result.names:
        client.get_logger().info(name)

    client.get_logger().info("get_params")
    names = ["height","car_type"]
    response = client.get_params(names)
    for v in response.values:
        if v.type == ParameterType.PARAMETER_STRING:
            client.get_logger().info("string:%s" % v.string_value)
        elif v.type == ParameterType.PARAMETER_DOUBLE:
            client.get_logger().info("double:%.2f" % v.double_value)

    client.get_logger().info("set_params")
    response = client.set_params()
    results = response.results
    client.get_logger().info("%d params setted" % len(results))
    for result in results:
        if not result.successful:
            client.get_logger().info("set failed")

    rclpy.shutdown()

if __name__ == '__main__':
    main()
----------------------------------------------------------------------
import rclpy
from rclpy.node import Node

class SubscribeClass(Node):
    def __init__(self):
        super().__init__('subscriber_node',allow_undeclared_parameters=True)
        self.get_logger().info("subscribe start...")

    def declare_param(self):
        self.get_logger().info("declare_param")

        #  不可删除参数声明
        self.declare_parameter("car_type","Tiger")
        self.declare_parameter("height",1.50)
        self.declare_parameter("wheels",4)

        # 可删除参数声明
        self.p2 = rclpy.Parameter("undcl_test",value = 100)
        self.set_parameters([self.p2])

    def get_param(self):
        self.get_logger().info("get_param")

        # 判断包含
        self.get_logger().info("包含 car_type 吗？%d" % self.has_parameter("car_type"))
        self.get_logger().info("包含 width 吗？%d" % self.has_parameter("width"))
        # 获取指定
        car_type = self.get_parameter("car_type")
        self.get_logger().info("%s = %s " % (car_type.name, car_type.value))
        # 获取所有
        params = self.get_parameters(["car_type","height","wheels"])
        self.get_logger().info("解析所有参数:")
        for param in params:
            self.get_logger().info("%s ---> %s" % (param.name, param.value))

    def update_param(self):
        self.get_logger().info("update_param")

        self.set_parameters([rclpy.Parameter("car_type",value = "horse")])
        param = self.get_parameter("car_type")
        self.get_logger().info("修改后: car_type = %s" %param.value)

    def del_param(self):
        self.get_logger().info("del_param")

        self.get_logger().info("删除操作前包含 car_type 吗？%d" % self.has_parameter("car_type"))
        self.undeclare_parameter("car_type")
        self.get_logger().info("删除操作后包含 car_type 吗？%d" % self.has_parameter("car_type"))


def main(args=None):
    rclpy.init(args=args)
    paramer = SubscribeClass()
    paramer.declare_param()
    paramer.get_param()
    paramer.update_param()
    paramer.del_param()
    rclpy.spin(paramer)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```



## 工具

### 命令

- `ros2 pkg`：查询功能包相关信息的参数

```txt
list 		列出所有功能包
prefix  	列出[指定]功能包路径
executables 输出指定功能包下的可执行程序。
xml 		输出指定功能包的package.xml内容
```

- `ros2 node`：节点相关

```txt
info  输出节点信息
list  输出运行中的节点的列表
```

- `ros2 interface`：接口(msg、srv、action)消息相关

```txt
list      输出所有可用的接口消息
package   输出指定功能包下的
packages  输出包含接口消息的功能包
proto     输出接口消息原型
show      输出接口消息定义格式
```

- `ros2 topic`：话题通信相关

```txt
bw       输出话题消息传输占用的带宽
delay    输出带有 header 的话题延迟
echo     输出某个话题下的消息
find     根据类型查找话题
hz       输出消息发布频率
info     输出话题相关信息
list     输出运行中的话题列表
pub      向指定话题发布消息
type     输出话题使用的接口类型
```

- `ros2 service`：服务通信相关

```txt
call  向某个服务发送请求
find  根据类型查找服务
list  输出运行中的服务列表
type  输出服务使用的接口类型
```

- `ros2 action`：动作通信相关

```txt
info       输出指定动作的相关信息
list       输出运行中的动作的列表
send_goal  向指定动作发送请求
```

- `ros2 param`：参数服务相关

```txt
delete    删除参数
describe  输出参数的描述信息
dump      将节点参数写入到磁盘文件
get       获取某个参数
list      输出可用的参数的列表
load      从磁盘文件加载参数到节点
set       设置参数
```

### 图形化

1. rqt：具有与ros2命令相同作用的图形化工具
2. rviz2：通信数据的

### launch

批量的启动ROS2节点



## 功能

> 功能包(下载、自定义)是相对独立的，可直接移植入工作空间
>
> 一些先进功能包：NAV2、OpenCV、MoveIt、Autoware、PX4、microROS…

### 分布式

> 以DDS域ID机制划分通信网络，实现主机间通信策略；默认域ID为0，只要**保证在同一网络中**即可实现分布式通信
>

```bash
# 将节点划分到域6，该节点不可与其他域节点通信
export ROS_DOMAIN_ID=6
# 0<= ROS_DOMAIN_ID <= 101, 每个域ID内节点数要求<=120(域101内节点数要求<=54)
```

### 重名问题

> 设备 -> 工作空间 -> 功能包 -> 节点 -> 话题，都可能存在重名

#### 功能包重名

- 同一工作空间下不允许功能包重名
- 不同工作空间下功能包重名会产生功能包覆盖，这与`~/.bashrc`中不同工作空间的`setup.bash`文件的加载顺序有关，先加载会被覆盖（ROS自带功能包优先加载）
- 在实际工作中，要求避免功能包重名

#### 节点重名

- 不同的节点可以有相同的节点名

- 节点重名可能导致通信逻辑上的混乱，要求避免节点重名，如下：

  - 名称重映射

    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap __name:=[new_node_name]
    ```

    ```xml
    <launch>
        <node pkg="[package_name]" exec="[program_name]" name="[new_node_name]" />
    </launch>
    ```
  
    ```cpp
    Node (const std::string &node_name,...)
    ```
  
    ```python
    Node(node_name,...)
    ```
  
  - 命名空间，如`/namespace1`
  
    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap __ns:=[namespace]
    ```
    
    ```xml
    <launch>
        <node pkg="[package_name]" exec="[program_name]" namespace="[namespace]" />
    </launch>
    ```
    
    ```cpp
    Node (const std::string &node_name, const std::string &namespace_, const NodeOptions &options=NodeOptions())
    ```
    
    ```python
    Node(node_name, namespace=None,...)
    ```

#### 话题重名

- 不同的节点可以有相同的话题名

- 节点需要按情况而定是否重名，如下：

  > - 全局话题(与节点命名空间平级)：定义时以`/`开头的名称，和命名空间、节点名称无关，名称为`/[topic_name]`
  > - 相对话题(与节点名称平级)：非`/`开头的名称，参考命名空间设置话题名称，名称为`/[namespace]/[topic_name]`
  > - 私有话题(节点名称的子级)：定义时以`~/`开头的名称，和命名空间、节点名称都有关系，名称为`/[namespace]/[node_name]/[topic_name]`

  - 名称重映射

    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap [old_node_name]:=[new_node_name]
    ```

    ```xml
    <launch>
        <node pkg="[package_name]" exec="[program_name]">
            <remap from="[old_node_name]" to="[new_node_name]" />
        </node>
    </launch>
    ```

  - 命名空间，要求话题非全局

    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap __ns:=[namespace]
    ```

    ```xml
    <launch>
        <nodepkg="[package_name]" exec="[program_name]" namespace="[namespace]" />
    </launch>
    ```

### 时间API

- `Rate`：创建频率，常用于设置while频率
- `Time`：创建时间戳，常用于控制时间的功能
- `Duration`：创建时间差，多用于计算时间戳

### TF坐标变换

> 节点间相对位置关系的转换

### 元功能包

> 打包多个功能包为一个虚包，里面没有实质性内容，但依赖于被打包的功能包，用于方便用户安装。

```bash
# 创建一个空包
ros2 pkg create metadata_pkg
```

```xml
<!--- 修改 package.xml 文件，添加执行时所依赖的包 --->
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>metadata</name>
  <version>0.0.0</version>
  <description>TODO: Package description</description>
  <maintainer email="longlong@todo.todo">longlong</maintainer>
  <license>TODO: License declaration</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

   <!--- 添加执行时所依赖的包名 --->
  <exec_depend>base_interface</exec_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>

```



## 社区

- [ROS Documentation](https://docs.ros.org/)
  - [ROS Index](https://index.ros.org/)
- [Questions - ROS Answers](https://answers.ros.org/questions/)
- [ROS Discourse](https://discourse.ros.org/)












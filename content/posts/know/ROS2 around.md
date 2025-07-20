---
draft: false

title: "ROS2 Around"
description: "ROS2 的调试工具与功能演示"
date: 2024-01-06
author: ["biglonglong"]

tags: ["summary", "ros2"]
summary: ""

math: false
weight: 202
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



## 工具

### 命令

查找或展示 node、interface、topic、service、action、param和具体信息

- `-h`：帮助文档

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

- `ros2 param`：参数服务相关，参数dump文件可被`ros2 run`

```txt
delete    删除参数
describe  输出参数的描述信息
dump      将节点参数写入到磁盘文件
get       获取某个参数
list      输出可用的参数的列表
load      从磁盘文件加载参数到节点
set       设置参数
```

-  `ros2 bag`：录制和回放话题

```txt
convert  给定一个 bag 文件，写出一个新的具有不同配置的 bag 文件；
info     输出 bag 文件的相关信息；
list     输出可用的插件信息；
play     回放 bag 文件数据；
record   录制 bag 文件数据；
reindex  重建 bag 的元数据文件。
```

> ```cpp
> #include "rclcpp/rclcpp.hpp"
> #include "rosbag2_cpp/writer.hpp"
> #include "geometry_msgs/msg/twist.hpp"
> class BagRecorder : public rclcpp::Node {
> public:
> BagRecorder() : Node("bag_recorder") {
>      writer_ = std::make_unique<rosbag2_cpp::Writer>();
>         writer_->open("my_bag");
>         subscription_ = create_subscription<geometry_msgs::msg::Twist>(
>         "/turtle1/cmd_vel", 10, std::bind(&BagRecorder::topic_callback, this, _1));
>    }
> private:
>  void topic_callback(std::shared_ptr<rclcpp::SerializedMessage> msg) const {
>     rclcpp::Time time_stamp = this->now();
>        writer_->write(msg, "/turtle1/cmd_vel", "geometry_msgs/msg/Twist", time_stamp);
>     }
>     rclcpp::Subscription<geometry_msgs::msg::Twist>::SharedPtr subscription_;
>    std::unique_ptr<rosbag2_cpp::Writer> writer_;
> };
> 
> int main(int argc, char * argv[]) {
> rclcpp::init(argc, argv);
> rclcpp::spin(std::make_shared<BagRecorder>());
>  rclcpp::shutdown();
>    return 0;
> }
> ----------------------------------------------------------------------
> #include "rclcpp/rclcpp.hpp"
> #include "rosbag2_cpp/reader.hpp"
> #include "geometry_msgs/msg/twist.hpp"
> class BagPlayer : public rclcpp::Node {
> public:
> BagPlayer() : Node("bag_player") {
>   reader_ = std::make_unique<rosbag2_cpp::Reader>();
>      reader_->open("my_bag");
>         while (reader_->has_next()) {
>          geometry_msgs::msg::Twist twist = reader_->read_next<geometry_msgs::msg::Twist>();
>          RCLCPP_INFO(this->get_logger(),"%.2f ---- %.2f",twist.linear.x, twist.angular.z);
>         }
>         reader_->close();
>     }
> private:
>  	std::unique_ptr<rosbag2_cpp::Reader> reader_;
> };
> 
> int main(int argc, char const *argv[]) {
> rclcpp::init(argc,argv);
>  rclcpp::spin(std::make_shared<BagPlayer>());
>  rclcpp::shutdown();
>     return 0;
> }
> ```

### 图形化

1. rqt：具有与ros2命令相同作用的图形化工具

2. rviz2：通信消息可视化

   ```bash
   ros2 run rviz2 rviz2 -d [config]
   ```

### launch

```python
# 批量运行节点
from launch import LaunchDescription
from launch_ros.actions import Node
# 获取功能包下share目录路径-------
import os
from ament_index_python.packages import get_package_share_directory
# 封装终端指令相关类--------------
from launch.actions import ExecuteProcess
# from launch.substitutions import FindExecutable
# launch参数声明与获取-----------------
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
# 文件包含相关-------------------
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
# 分组相关----------------------
from launch_ros.actions import PushRosNamespace
from launch.actions import GroupAction
# 事件相关----------------------
from launch.event_handlers import OnProcessStart OnProcessExit
from launch.actions import RegisterEventHandler, LogInfo

def generate_launch_description():
    turtle1 = Node(package="turtlesim", executable="turtlesim_node", 
                namespace="ns_1", name="t1",  # 命名空间和节点重命名
                exec_name="turtle_label",  # 流程标签
                respawn=True)  # 崩溃后重启
    turtle2 = Node(package="turtlesim", executable="turtlesim_node", name="t3", 
                remappings=[("/turtle1/cmd_vel","/cmd_vel")] #话题重映射
                )
    turtle3 = Node(package="turtlesim", executable="turtlesim_node", name="t2",
                # 服务参数设置1
                # parameters=[{"background_r": 0,"background_g": 0,"background_b": 0}],
                # 服务参数设置2: 从 yaml 文件加载参数，yaml 文件所属目录需要在配置文件中安装。
                parameters=[os.path.join(get_package_share_directory("cpp01_launch"),"config","t2.yaml")]
                )
    rviz = Node(package="rviz2", executable="rviz2",
                # 节点启动时传参
                arguments=["-d", os.path.join(get_package_share_directory("cpp01_launch"),"config","my.rviz")]
    )
    turtle4 = Node(package="turtlesim", executable="turtlesim_node",
                # 节点启动时传参，相当于 arguments 传参时添加前缀 --ros-args 
                ros_arguments=["--remap", "__ns:=/t4_ns", "--remap", "__node:=t4"]
    )
    
    # 终端指令
    spawn = ExecuteProcess(
        # cmd 1
        # cmd = [
        #     FindExecutable(name = "ros2"), # 不可以有空格
        #     " service call",
        #     " /spawn turtlesim/srv/Spawn",
        #     " \"{x: 8.0, y: 9.0,theta: 1.0, name: 'turtle2'}\""
        # ],
        # cmd 2
        cmd=["ros2 service call /spawn turtlesim/srv/Spawn \"{x: 8.0, y: 9.0,theta: 0.0, name: 'turtle2'}\""],
        output="both",
        shell=True)

    # launch参数动态设置
    #ros2 launch cpp01_launch py03_args.launch.py background_r:=200 background_g:=80 background_b:=30
    decl_bg_r = DeclareLaunchArgument(name="background_r",default_value="255")
    decl_bg_g = DeclareLaunchArgument(name="background_g",default_value="255")
    decl_bg_b = DeclareLaunchArgument(name="background_b",default_value="255")
    turtle = Node(package="turtlesim", executable="turtlesim_node",
            parameters=[{"background_r": LaunchConfiguration("background_r"), "background_g": LaunchConfiguration("background_g"), "background_b": LaunchConfiguration("background_b")}]
            )
    
    # 文件包含
    include_launch = IncludeLaunchDescription(
        launch_description_source= PythonLaunchDescriptionSource(
            launch_file_path=os.path.join(
                get_package_share_directory("cpp01_launch"),
                "launch/py",
                "py03_args.launch.py"
            )
        ),
        launch_arguments={
            "background_r": "200",
            "background_g": "100",
            "background_b": "70",
        }.items()
    )
    
    # 分组设置
    turtlex = Node(package="turtlesim",executable="turtlesim_node",name="t1")
    turtley = Node(package="turtlesim",executable="turtlesim_node",name="t2")
    turtlez = Node(package="turtlesim",executable="turtlesim_node",name="t3")
    g1 = GroupAction(actions=[PushRosNamespace(namespace="g1"),turtlex, turtley])
    g2 = GroupAction(actions=[PushRosNamespace(namespace="g2"),turtlez])
    
    # 添加事件
    start_event = RegisterEventHandler(
        event_handler=OnProcessStart(
            target_action = turtle,
            on_start = spawn
        )
    )
    exit_event = RegisterEventHandler(
        event_handler=OnProcessExit(
            target_action = turtle,
            on_exit = [LogInfo(msg = "turtlesim_node退出!")]
        )
    )
    return LaunchDescription([turtle1, turtle2, turtle3, turtle4, rviz, decl_bg_r, decl_bg_g, decl_bg_b, turtle, start_event, exit_event, include_launch, g1, g2])
```



## 功能

> 功能包(下载、自定义)是相对独立的，可直接移植入工作空间
>
> 一些先进功能包：NAV2、OpenCV、MoveIt、Autoware、PX4、microROS…

### 重名问题

设备 -> 工作空间 -> 功能包 -> 节点 -> 话题，都可能存在重名；下面使用命令和源码解决，[launch](# launch)部分也介绍了如何解决重名问题

#### 功能包重名

- 同一工作空间下不允许功能包重名
- 不同工作空间下功能包重名会产生功能包覆盖，这与`~/.bashrc`中不同工作空间的`setup.bash`文件的加载顺序有关，先加载会被覆盖（ROS自带功能包优先加载易被覆盖）
- 在实际工作中，要求避免功能包重名

#### 节点重名

- 不同的节点可以有相同的节点名

- 节点重名可能导致通信逻辑上的混乱，要求避免节点重名，如下：

  - 名称重映射

    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap __name:=[new_node_name]
    ```

    ```code
    // cpp
    Node (const std::string &node_name,...)
    # python
    Node(node_name,...)
    ```

  - 命名空间，如`/namespace1`

    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap __ns:=[namespace]
    ```

    ```code
    // cpp
    Node (const std::string &node_name, const std::string &namespace_, const NodeOptions &options=NodeOptions())
    # python
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

  - 命名空间，要求话题非全局

    ```bash
    ros2 run [package_name] [program_name] --ros-args --remap __ns:=[namespace]
    ```

### TF坐标变换

实现不同坐标系之间的坐标帧的转换，由坐标变换广播方和坐标变换监听方两部分组成。每个坐标变换广播方一般会发布一组坐标系相对关系，而坐标变换监听方则会将多组坐标系相对关系融合为一棵坐标树（该坐标树有且仅有一个根坐标系），并可以实现任意坐标系之间或坐标点与坐标系的变换。

- 两个重要接口

```msg
# geometry_msgs/msg/TransformStamped
header:
  stamp:
    sec: 0
    nanosec: 0
  frame_id: ''
child_frame_id: ''
transform:
  translation:
    x: 0.0
    y: 0.0
    z: 0.0
  rotation:
    x: 0.0
    y: 0.0
    z: 0.0
    w: 1.0
    
# geometry_msgs/msg/PointStamped
header:
  stamp:
    sec: 0
    nanosec: 0
  frame_id: ''
point:
  x: 0.0
  y: 0.0
  z: 0.0
```

- 两个重要tf功能包工具

1. `tf2_ros`

   1. static_transform_publisher：该节点用于广播静态坐标变换；

      ```bash
      ros2 run tf2_ros static_transform_publisher --x [x] --y [y] --z [z] --yaw [yaw] --pitch [pitch] --roll [roll] --frame-id [frame_id] --child-frame-id [child_frame_id]
      ```

   2. tf2_monitor：该节点用于打印所有或特定坐标系的发布频率与网络延迟；

   3. tf2_echo：该节点用于打印特定坐标系的平移旋转关系。

2. `tf2_tools`

   1. view_frames：该节点可以生成显示坐标系关系的 pdf 文件，该文件包含树形结构的坐标系图谱。

#### 静态tf广播

```cpp
#include <rclcpp/rclcpp.hpp>
#include <tf2/LinearMath/Quaternion.h>
#include <geometry_msgs/msg/transform_stamped.hpp>
#include <tf2_ros/static_transform_broadcaster.h>
using std::placeholders::_1;

class StaticFrameBroadcaster : public rclcpp::Node {
public:
    explicit StaticFrameBroadcaster(char * transformation[]): Node("static_frame_broadcaster"){
    tf_publisher_ = std::make_shared<tf2_ros::StaticTransformBroadcaster>(this);
    this->make_transforms(transformation);
    }

private:
    void make_transforms(char * transformation[]) {
        geometry_msgs::msg::TransformStamped t;
        rclcpp::Time now = this->get_clock()->now();
        t.header.stamp = now;
        t.header.frame_id = transformation[7];
        t.child_frame_id = transformation[8];
        t.transform.translation.x = atof(transformation[1]);
        t.transform.translation.y = atof(transformation[2]);
        t.transform.translation.z = atof(transformation[3]);
        tf2::Quaternion q;
        q.setRPY(
          atof(transformation[4]),
          atof(transformation[5]),
          atof(transformation[6]));
        t.transform.rotation.x = q.x();
        t.transform.rotation.y = q.y();
        t.transform.rotation.z = q.z();
        t.transform.rotation.w = q.w();

        tf_publisher_->sendTransform(t);
    }
    std::shared_ptr<tf2_ros::StaticTransformBroadcaster> tf_publisher_;
};

int main(int argc, char * argv[]) {
    auto logger = rclcpp::get_logger("logger");
    if (argc != 9) {
        RCLCPP_INFO(logger, "x y z roll pitch yaw frame_id child_frame_id");
        return 1;
    }
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<StaticFrameBroadcaster>(argv));
    rclcpp::shutdown();
    return 0;
}
```

```python
import sys
import rclpy
from rclpy.node import Node
import tf_transformations
from geometry_msgs.msg import TransformStamped
from tf2_ros.static_transform_broadcaster import StaticTransformBroadcaster

class StaticFrameBroadcaster(Node):
    def __init__(self, transformation):
        super().__init__('static_frame_broadcaster')
        self._tf_publisher = StaticTransformBroadcaster(self)
        self.make_transforms(transformation)

    def make_transforms(self, transformation):
        static_transformStamped = TransformStamped()
        static_transformStamped.header.stamp = self.get_clock().now().to_msg()
        static_transformStamped.header.frame_id = sys.argv[7]
        static_transformStamped.child_frame_id = sys.argv[8]
        static_transformStamped.transform.translation.x = float(sys.argv[1])
        static_transformStamped.transform.translation.y = float(sys.argv[2])
        static_transformStamped.transform.translation.z = float(sys.argv[3])
        quat = tf_transformations.quaternion_from_euler(
            float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6]))
        static_transformStamped.transform.rotation.x = quat[0]
        static_transformStamped.transform.rotation.y = quat[1]
        static_transformStamped.transform.rotation.z = quat[2]
        static_transformStamped.transform.rotation.w = quat[3]
        self._tf_publisher.sendTransform(static_transformStamped)

def main():
    logger = rclpy.logging.get_logger('logger')
    if len(sys.argv) < 9:
        logger.info('x y z roll pitch yaw frame_id child_frame_id')
        sys.exit(0)
    rclpy.init()
    node = StaticFrameBroadcaster(sys.argv)
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### 动态tf广播

```cpp
#include <rclcpp/rclcpp.hpp>
#include <tf2/LinearMath/Quaternion.h>
#include <tf2_ros/transform_broadcaster.h>
#include <geometry_msgs/msg/transform_stamped.hpp>
#include <turtlesim/msg/pose.hpp>
using std::placeholders::_1;

class DynamicFrameBroadcaster : public rclcpp::Node {
public:
  DynamicFrameBroadcaster(): Node("dynamic_frame_broadcaster") {
    tf_broadcaster_ = std::make_unique<tf2_ros::TransformBroadcaster>(*this);
    std::string topic_name = "/turtle1/pose";
    subscription_ = this->create_subscription<turtlesim::msg::Pose>(topic_name, 10,
      std::bind(&DynamicFrameBroadcaster::handle_turtle_pose, this, _1));
  }
private:
  void handle_turtle_pose(const turtlesim::msg::Pose & msg) {
    geometry_msgs::msg::TransformStamped t;
    rclcpp::Time now = this->get_clock()->now();
    t.header.stamp = now;
    t.header.frame_id = "world";
    t.child_frame_id = "turtle1";
    t.transform.translation.x = msg.x;
    t.transform.translation.y = msg.y;
    t.transform.translation.z = 0.0;
    tf2::Quaternion q;
    q.setRPY(0, 0, msg.theta);
    t.transform.rotation.x = q.x();
    t.transform.rotation.y = q.y();
    t.transform.rotation.z = q.z();
    t.transform.rotation.w = q.w();
    tf_broadcaster_->sendTransform(t);
  }
  rclcpp::Subscription<turtlesim::msg::Pose>::SharedPtr subscription_;
  std::unique_ptr<tf2_ros::TransformBroadcaster> tf_broadcaster_;
};

int main(int argc, char * argv[]) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<DynamicFrameBroadcaster>());
  rclcpp::shutdown();
  return 0;
}
```

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster
import tf_transformations
from turtlesim.msg import Pose

class DynamicFrameBroadcaster(Node):
    def __init__(self):
        super().__init__('dynamic_frame_broadcaster')
        self.br = TransformBroadcaster(self)
        self.subscription = self.create_subscription(Pose, '/turtle1/pose', self.handle_turtle_pose,1)
    def handle_turtle_pose(self, msg):
        t = TransformStamped()
        t.header.stamp=self.get_clock().now().to_msg()
        t.header.frame_id = 'world'
        t.child_frame_id = 'turtlel'
        t.transform.translation.x= msg.x
        t.transform.translation.y= msg.y
        t.transform.translation.z=0.0
        q=tf_transformations.quaternion_from_euler(0,0, msg.theta)
        t.transform.rotation.x=q[0]
        t.transform.rotation.y = q[1]
        t.transform.rotation.z=q[2]
        t.transform.rotation.w =q[3]
        self.br.sendTransform(t)

def main():
    rclpy.init()
    node = DynamicFrameBroadcaster()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### 坐标点发布

```cpp
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/point_stamped.hpp"
using namespace std::chrono_literals;

class PointPublisher: public rclcpp::Node {
public:
    PointPublisher():Node("point_publisher"),x(0.1) {
        point_pub_= this->create_publisher<geometry_msgs::msg::PointStamped>("point",10);
        timer_= this->create_wall_timer(0.1s,std::bind(&PointPublisher::on_timer, this));
    }
private:
    void on_timer(){
        geometry_msgs::msg::PointStamped point;
        point.header.frame_id = "laser";
        point.header.stamp = this->now();
        x += 0.004;
        point.point.x=x;
        point.point.y = 0.0;
        point.point.z=0.1;
        point_pub_->publish(point);
    }
    rclcpp::Publisher<geometry_msgs::msg::PointStamped>::SharedPtr point_pub_;
    rclcpp::TimerBase::SharedPtr timer_;
    double_t x;
};

int main(int argc, char const *argv[]) {
    rclcpp::init(argc,argv);
    rclcpp::spin(std::make_shared<PointPublisher>());
    rclcpp::shutdown();
    return 0;
}
```

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PointStamped

class PointPublisher(Node):
    def __init__(self):    
        super().__init__('point_publisher')
        self.pub =self.create_publisher(PointStamped,'point', 10)
        self.timer=self.create_timer(1.0,self.on_timer)
        self.x=0.1
    def on_timer(self):
        ps =PointStamped()
        ps.header.stamp=self.get_clock().now().to_msg()
        ps.header.frame_id='laser'
        self.x += 0.02
        ps.point.x=self.x
        ps.point.y = 0.0
        ps.point.z=0.2
        self.pub.publish(ps)

def main():
    rclpy.init()
    node =PointPublisher()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### 坐标系变换监听

```cpp
#include "rclcpp/rclcpp.hpp"
#include "tf2_ros/buffer.h"
#include "tf2_ros/transform_listener.h"
#include "tf2/LinearMath/Quaternion.h"
using namespace std::chrono_literals;

class FrameListener : public rclcpp::Node {
public:
  FrameListener():Node("frame_listener"){
    tf_buffer_ = std::make_unique<tf2_ros::Buffer>(this->get_clock());
    transform_listener_ = std::make_shared<tf2_ros::TransformListener>(*tf_buffer_);
    timer_ = this->create_wall_timer(1s, std::bind(&FrameListener::on_timer,this));
  }

private:
  void on_timer() {
    try {
        auto transformStamped = tf_buffer_->lookupTransform("camera","laser",tf2::TimePointZero);
        RCLCPP_INFO(this->get_logger(),"frame_id:%s",transformStamped.header.frame_id.c_str());
        RCLCPP_INFO(this->get_logger(),"child_frame_id:%s",transformStamped.child_frame_id.c_str());
        RCLCPP_INFO(this->get_logger(),"坐标:(%.2f,%.2f,%.2f)",
                transformStamped.transform.translation.x,
                transformStamped.transform.translation.y,
                transformStamped.transform.translation.z);
    }
    catch(const tf2::LookupException& e) {
        RCLCPP_INFO(this->get_logger(),"坐标变换异常：%s",e.what());
    }
  }
    std::shared_ptr<tf2_ros::TransformListener> transform_listener_;
    rclcpp::TimerBase::SharedPtr timer_;
    std::unique_ptr<tf2_ros::Buffer> tf_buffer_;
};

int main(int argc, char const *argv[]) {
    rclcpp::init(argc,argv);
    rclcpp::spin(std::make_shared<FrameListener>());
    rclcpp::shutdown();
    return 0;
}
```

```python
import rclpy
from rclpy.node import Node
from tf2_ros.buffer import Buffer
from tf2_ros.transform_listener import TransformListener
from rclpy.time import Time

class TFListener(Node):
    def __init__(self):
        super().__init__("tf_listener")
        self.buffer = Buffer()
        self.listener = TransformListener(self.buffer,self)
        self.timer = self.create_timer(1.0,self.on_timer)

    def on_timer(self):
        if self.buffer.can_transform("camera","laser",Time()):
            ts = self.buffer.lookup_transform("camera","laser",Time())
            self.get_logger().info(
                "转换的结果，父坐标系:%s,子坐标系:%s,偏移量:(%.2f,%.2f,%.2f)"
                % (ts.header.frame_id,ts.child_frame_id,
                ts.transform.translation.x,
                ts.transform.translation.y,
                ts.transform.translation.z)
            )
        else:
            self.get_logger().info("转换失败......")

def main():
    rclpy.init()
    rclpy.spin(TFListener())
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### 坐标点变换监听

```cpp
#include <geometry_msgs/msg/point_stamped.hpp>
#include <message_filters/subscriber.h>
#include <rclcpp/rclcpp.hpp>
#include <tf2_ros/buffer.h>
#include <tf2_ros/create_timer_ros.h>
#include <tf2_ros/message_filter.h>
#include <tf2_ros/transform_listener.h>
// #ifdef TF2_CPP_HEADERS
//   #include <tf2_geometry_msgs/tf2_geometry_msgs.hpp>
// #else
//   #include <tf2_geometry_msgs/tf2_geometry_msgs.h>
// #endif
#include <tf2_geometry_msgs/tf2_geometry_msgs.hpp>
using namespace std::chrono_literals;

class MessageFilterPointListener : public rclcpp::Node {
public:
	MessageFilterPointListener(): Node("message_filter_point_listener") {
        target_frame_ = "base_link";
        typedef std::chrono::duration<int> seconds_type;
        seconds_type buffer_timeout(1);
        
        // 创建tf缓存对象指针；
        tf2_buffer_ = std::make_shared<tf2_ros::Buffer>(this->get_clock());
        auto timer_interface = std::make_shared<tf2_ros::CreateTimerROS>(
          this->get_node_base_interface(),
          this->get_node_timers_interface());
        tf2_buffer_->setCreateTimerInterface(timer_interface);
        // 创建tf监听器；
        tf2_listener_ = std::make_shared<tf2_ros::TransformListener>(*tf2_buffer_);
        // 创建坐标点订阅方并订阅指定话题；
        point_sub_.subscribe(this, "point");
        
        // 创建消息过滤器过滤被处理的数据；
        tf2_filter_ = std::make_shared<tf2_ros::MessageFilter<geometry_msgs::msg::PointStamped>>(
          point_sub_, *tf2_buffer_, target_frame_, 100, this->get_node_logging_interface(),
          this->get_node_clock_interface(), buffer_timeout);
        // 为消息过滤器注册转换坐标点数据的回调函数。
        tf2_filter_->registerCallback(&MessageFilterPointListener::msgCallback, this);
  }

private:
  void msgCallback(const geometry_msgs::msg::PointStamped::SharedPtr point_ptr) {
    geometry_msgs::msg::PointStamped point_out;
    try {
      tf2_buffer_->transform(*point_ptr, point_out, target_frame_);
      RCLCPP_INFO(
        this->get_logger(), "坐标点相对于base_link的坐标:(%.2f,%.2f,%.2f)",
        point_out.point.x,
        point_out.point.y,
        point_out.point.z);
    }
    catch (tf2::TransformException & ex) {
		RCLCPP_WARN(this->get_logger(), "Failure %s\n", ex.what());
    }
  }
    std::string target_frame_;
    std::shared_ptr<tf2_ros::Buffer> tf2_buffer_;
    std::shared_ptr<tf2_ros::TransformListener> tf2_listener_;
    message_filters::Subscriber<geometry_msgs::msg::PointStamped> point_sub_;
    std::shared_ptr<tf2_ros::MessageFilter<geometry_msgs::msg::PointStamped>> tf2_filter_;
};

int main(int argc, char * argv[]) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<MessageFilterPointListener>());
  rclcpp::shutdown();
  return 0;
}
```

### turtlebot3

```bash
# Start
sudo apt install ros-humble-gazebo-*
sudo apt install ros-humble-cartographer
sudo apt install ros-humble-cartographer-ros
sudo apt install ros-humble-navigation2
sudo apt install ros-humble-nav2-bringup
sudo apt install ros-humble-turtlebot3*
sudo apt install ros-humble-teleop-twist-keyboard
```

```bash
# Demo
export TURTLEBOT3_MODEL=[burger|waffle|waffle_pi]
source /usr/share/gazebo/setup.sh
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
ros2 run turtlebot3_teleop teleop_keyboard || ros2 run turtlebot3_gazebo turtlebot3_drive
```

```bash
# Rviz
ros2 launch turtlebot3_fake_node turtlebot3_fake_node.launch.py ||ros2 launch turtlebot3_bringup rviz2.launch.py
```

```bash
# Map Nav
ros2 launch turtlebot3_cartographer cartographer.launch.py use_sim_time:=true
ros2 run nav2_map_server map_saver_cli -f ./maps/map

# navigation2.launch.py 基于 nav2_bringup/bring_up.launch.py 但 navigation2.launch.py的params_file存在问题
	# ros2 launch turtlebot3_navigation2 navigation2.launch.py use_sim_time:=true map:=./maps/map.yaml 
# 一个正确的params_file可以参考[nav2_bringup/params/nav2_params.yaml]
	# ros2 launch turtlebot3_navigation2 navigation2.launch.py use_sim_time:=true map:=./maps/map.yaml params_file:=[nav2_bringup/params/nav2_params.yaml]
ros2 launch nav2_bringup bringup_launch.py use_sim_time:=true map:=./maps/map.yaml
rviz2 -d ...  # 设置起始位姿，供nav2/amcl导航，后设置目标点...
```



## 社区

- [ROS Documentation](https://docs.ros.org/)
  - [ROS Index](https://index.ros.org/)
- [Questions - ROS Answers](https://answers.ros.org/questions/)
- [ROS Discourse](https://discourse.ros.org/)

业务关注三个分析：节点、话题、网络



## 其他

### 时间API

- `Rate`：创建频率，常用于设置while频率
- `Time`：创建时间戳，常用于控制时间的功能
- `Duration`：创建时间差，多用于计算时间戳

### 分布式

以DDS域ID机制划分通信网络，实现主机间通信策略；默认域ID为0，只要**保证在同一网络中**即可实现分布式通信

```bash
# 将节点划分到域6，该节点不可与其他域节点通信
export ROS_DOMAIN_ID=6
# 0<= ROS_DOMAIN_ID <= 101, 每个域ID内节点数要求<=120(域101内节点数要求<=54)
```

### 元功能包

打包多个功能包为一个虚包，里面没有实质性内容，但依赖于被打包的功能包，用于方便用户安装。

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
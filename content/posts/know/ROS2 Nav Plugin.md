---
draft: false

title: "ROS2 Nav Plugin"
description: "ROS2 规划器和控制器导航"
date: 2024-01-25
author: ["biglonglong"]

tags: ["summary", "ros2", "navigation", "plugin"]
summary: ""

math: true
weight: 3
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

## 规控

动态加载和卸载插件（`ClassLoader`加载动态链接库--抽象类子类），如控制器、传感器、规划器，下图所示：

![](https://ros2-industrial-workshop.readthedocs.io/en/latest/_images/navigation_overview.png)

几个规划消息：

- `ros2 interface proto geometry_msgs/msg/PoseStamped` 位置

```txt
header:
  stamp:
    sec: 0
    nanosec: 0
  frame_id: ''
pose:
  position:
    x: 0.0
    y: 0.0
    z: 0.0
  orientation:
    x: 0.0
    y: 0.0
    z: 0.0
    w: 1.0
```

- `ros2 interface proto nav_msgs/msg/OccupancyGrid ` 栅格地图

  ```txt
  header:
    stamp:
      sec: 0
      nanosec: 0
    frame_id: ''
  info:
    map_load_time:
      sec: 0
      nanosec: 0
    resolution: 0.0
    width: 0
    height: 0
    origin:
      position:
        x: 0.0
        y: 0.0
        z: 0.0
      orientation:
        x: 0.0
        y: 0.0
        z: 0.0
        w: 1.0
  data: []
  ```

- `ros2 interface proto nav_msgs/msg/Path ` 路径

  ```txt
  header:
    stamp:
      sec: 0
      nanosec: 0
    frame_id: ''
  poses: []
  ```

- 像素坐标(row_index, col_index)与实际坐标(x, y)的转换

  - 实际坐标支持右手坐标系，原点为origin
  - 图像坐标y轴向下，x轴向右，原点在图像左上角


$$
row.index = \frac{y-info.origin.y}{info.resolution}
$$

$$
col.index = \frac{x-info.origin.x}{info.resolution}
$$

$$
occupied.status = data[row.index*map.width + col.index]
$$

more to check：[Nav2 中文网](https://nav2.fishros.com/)



## pluginlib流程

1. 依赖于`pluginlib`

```bash
ros2 pkg create motion_control_system --dependencies pluginlib
```

2. `[package_name]\include\[package_name]`下编写头文件`motion_control_interface.hpp`，即抽象类编写规范

```cpp
#ifndef MOTION_CONTROL_INTERFACE_HPP
#define MOTION_CONTROL_INTERFACE_HPP

namespace motion_control_system {

    class MotionController
    {
    private:
    public:
        virtual void start() = 0;
        virtual void stop() = 0;
    };
    
}

#endif // MOTION_CONTROL_INTERFACE_HPP
```

3. `[package_name]/include/[package_name]`下编写插件`spin_motion_controller.hpp`，即子类编写规范

```cpp
#ifndef SPIN_MOTION_CONTROLLER_HPP
#define SPIN_MOTION_CONTROLLER_HPP
#include "motion_control_system/motion_control_interface.hpp"

namespace motion_control_system {

    class SpinMotionController: public MotionController
    {
    private:
    public:
        void start() override;
        void stop() override;
    };
    
}

#endif // SPIN_MOTION_CONTROLLER_HPP
```

4. `[package_name]/src`下编写插件`spin_motion_controller.cpp`，即子类定义

```cpp
#include <iostream>
#include "motion_control_system/spin_motion_controller.hpp"

namespace motion_control_system {

    void SpinMotionController::start()
    {
        std::cout << "SpinMotionController::start" << std::endl;
    }

    void SpinMotionController::stop()
    {
        std::cout << "SpinMotionController::stop" << std::endl;
    }
    
}

#include "pluginlib/class_list_macros.hpp"
PLUGINLIB_EXPORT_CLASS(motion_control_system::SpinMotionController, motion_control_system::MotionController)
```

5. `[package_name]`下配置`CmakeList.txt`，创建`spin_motion_plugin.xml`；此时，`install/[package_name]/lib`下生成插件动态链接库

```txt
# find dependencies
find_package(ament_cmake REQUIRED)
find_package(pluginlib REQUIRED)

include_directories(include)
set(library_name ${PROJECT_NAME}_plugin)
add_library(${library_name} SHARED src/spin_motion_controller.cpp)
ament_target_dependencies(${library_name} pluginlib)

install(TARGETS ${library_name}
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin
)
install(DIRECTORY include/
  DESTINATION include/
)

# pluginlib_export_xml
pluginlib_export_plugin_description_file(motion_control_system spin_motion_plugin.xml)

# 这里编译了 hpp -> cpp -> exe，即${PROJECT_NAME}_plugin；然后要求导出到 motion_control_system spin_motion_plugin.xml
```

```xml
<library path="motion_control_system_plugin">
    <class name="motion_control_system/SpinMotionController" type="motion_control_system::SpinMotionController" base_class_type="motion_control_system::MotionController">
    <description>Spin Motion Controller</description>
    </class>
</library>

<!--- 在  motion_control_system spin_motion_plugin.xml 中，将 exe(${PROJECT_NAME}_plugin) 引出为插件类 motion_control_system/SpinMotionController--->
```

6. 使用插件

```cpp
#include "motion_control_system/motion_control_interface.hpp"
#include <pluginlib/class_loader.hpp>

int main(int argc, char **argv) {
    if (argc != 2) return 0;
    std::string controller_name = argv[1];
    pluginlib::ClassLoader<motion_control_system::MotionController> 
        controller_loader("motion_control_system", "motion_control_system::MotionController");
    
    auto controller = controller_loader.createSharedInstance(controller_name);
    controller->start();
    controller->stop();
    return 0;
}
```



## 规划器Plugin

1. 依赖于`nav2_core`

```bash
ros2 pkg create nav2_custom_planner --dependencies pluginlib nav2_core
```

2. `[package_name]/include/[package_name]`下编写插件`nav2_custom_planner.hpp`，即`nav2_core::GlobalPlanner `子类编写规范

```cpp
#ifndef NAV2_CUSTOM_PLANNER__NAV2_CUSTOM_PLANNER_HPP_
#define NAV2_CUSTOM_PLANNER__NAV2_CUSTOM_PLANNER_HPP_

#include <memory>
#include <string>

#include "geometry_msgs/msg/point.hpp"
#include "geometry_msgs/msg/pose_stamped.hpp"
#include "nav2_costmap_2d/costmap_2d_ros.hpp"
#include "nav_msgs/msg/path.hpp"

#include "nav2_core/global_planner.hpp"
#include "rclcpp/rclcpp.hpp"
#include "nav2_util/lifecycle_node.hpp"
#include "nav2_util/robot_utils.hpp"

namespace nav2_custom_planner {

    class CustomPlanner : public nav2_core::GlobalPlanner 
    {
    public:
        CustomPlanner() = default;
        ~CustomPlanner() = default;
        // 插件配置方法
        void configure(
            const rclcpp_lifecycle::LifecycleNode::WeakPtr &parent, std::string name,
            std::shared_ptr<tf2_ros::Buffer> tf,
            std::shared_ptr<nav2_costmap_2d::Costmap2DROS> costmap_ros) override;
        // 插件清理方法
        void cleanup() override;
        // 插件激活方法
        void activate() override;
        // 插件停用方法
        void deactivate() override;
        // 为给定的起始和目标位姿创建路径的方法
        nav_msgs::msg::Path createPlan(const geometry_msgs::msg::PoseStamped &start,
                    const geometry_msgs::msg::PoseStamped &goal) override;

    private:
        // 坐标变换缓存指针，可用于查询坐标关系
        std::shared_ptr<tf2_ros::Buffer> tf_;
        // 节点指针
        nav2_util::LifecycleNode::SharedPtr node_;
        // 全局代价地图
        nav2_costmap_2d::Costmap2D *costmap_;
        // 全局代价地图的坐标系
        std::string global_frame_, name_;
        // 插值分辨率
        double interpolation_resolution_;
    };

}

#endif // NAV2_CUSTOM_PLANNER__NAV2_CUSTOM_PLANNER_HPP_
```

3. `[package_name]/src`下编写插件`nav2_custom_planner.cpp`，即子类定义

```cpp
#include <cmath>
#include <memory>
#include <string>
#include "nav2_util/node_utils.hpp"
#include "nav2_core/exceptions.hpp"
#include "nav2_custom_planner/nav2_custom_planner.hpp"

// name_、node_、tf_、costmap_、global_frame_、interpolation_resolution_
// start、end、path
namespace nav2_custom_planner
{

    void CustomPlanner::configure(
        const rclcpp_lifecycle::LifecycleNode::WeakPtr &parent, std::string name,
        std::shared_ptr<tf2_ros::Buffer> tf,
        std::shared_ptr<nav2_costmap_2d::Costmap2DROS> costmap_ros)
    {
        name_ = name;
        node_ = parent.lock();
        tf_ = tf;
        costmap_ = costmap_ros->getCostmap();
        global_frame_ = costmap_ros->getGlobalFrameID();
        // 参数初始化
        nav2_util::declare_parameter_if_not_declared(
            node_, name_ + ".interpolation_resolution", rclcpp::ParameterValue(0.1));
        node_->get_parameter(name_ + ".interpolation_resolution",
                             interpolation_resolution_);
    }

    void CustomPlanner::cleanup()
    {
        RCLCPP_INFO(node_->get_logger(), "正在清理类型为 CustomPlanner 的插件 %s", name_.c_str());
    }

    void CustomPlanner::activate()
    {
        RCLCPP_INFO(node_->get_logger(), "正在激活类型为 CustomPlanner 的插件 %s", name_.c_str());
    }

    void CustomPlanner::deactivate()
    {
        RCLCPP_INFO(node_->get_logger(), "正在停用类型为 CustomPlanner 的插件 %s", name_.c_str());
    }

    nav_msgs::msg::Path
    CustomPlanner::createPlan(const geometry_msgs::msg::PoseStamped &start,
                              const geometry_msgs::msg::PoseStamped &goal)
    {
        // 1.声明并初始化 global_path
        nav_msgs::msg::Path global_path;
        global_path.poses.clear();
        global_path.header.stamp = node_->now();
        global_path.header.frame_id = global_frame_;

        // 2.检查目标和起始状态是否在全局坐标系中
        if (start.header.frame_id != global_frame_)
        {
            RCLCPP_ERROR(node_->get_logger(), "规划器仅接受来自 %s 坐标系的起始位置",
                         global_frame_.c_str());
            return global_path;
        }

        if (goal.header.frame_id != global_frame_)
        {
            RCLCPP_INFO(node_->get_logger(), "规划器仅接受来自 %s 坐标系的目标位置",
                        global_frame_.c_str());
            return global_path;
        }

        // 3.计算当前插值分辨率 interpolation_resolution_ 下的循环次数和步进值
        int total_number_of_loop =
            std::hypot(goal.pose.position.x - start.pose.position.x,
                       goal.pose.position.y - start.pose.position.y) /
            interpolation_resolution_;
        double x_increment =
            (goal.pose.position.x - start.pose.position.x) / total_number_of_loop;
        double y_increment =
            (goal.pose.position.y - start.pose.position.y) / total_number_of_loop;

        // 4. 生成路径
        for (int i = 0; i < total_number_of_loop; ++i)
        {
            geometry_msgs::msg::PoseStamped pose; // 生成一个点
            pose.pose.position.x = start.pose.position.x + x_increment * i;
            pose.pose.position.y = start.pose.position.y + y_increment * i;
            pose.pose.position.z = 0.0;
            pose.header.stamp = node_->now();
            pose.header.frame_id = global_frame_;
            // 将该点放到路径中
            global_path.poses.push_back(pose);
        }

        // 5.使用 costmap 检查该条路径是否经过障碍物
        for (geometry_msgs::msg::PoseStamped pose : global_path.poses)
        {
            unsigned int mx, my; // 将点的坐标转换为栅格坐标
            if (costmap_->worldToMap(pose.pose.position.x, pose.pose.position.y, mx, my))
            {
                unsigned char cost = costmap_->getCost(mx, my); // 获取对应栅格的代价值
                // 如果存在致命障碍物则抛出异常
                if (cost == nav2_costmap_2d::LETHAL_OBSTACLE)
                {
                    RCLCPP_WARN(node_->get_logger(),"在(%f,%f)检测到致命障碍物，规划失败。",
                        pose.pose.position.x, pose.pose.position.y);
                    throw nav2_core::PlannerException(
                        "无法创建目标规划: " + std::to_string(goal.pose.position.x) + "," +
                        std::to_string(goal.pose.position.y));
                }
            }
        }

        // 6.收尾，将目标点作为路径的最后一个点并返回路径
        geometry_msgs::msg::PoseStamped goal_pose = goal;
        goal_pose.header.stamp = node_->now();
        goal_pose.header.frame_id = global_frame_;
        global_path.poses.push_back(goal_pose);
        return global_path;
    }

}

#include "pluginlib/class_list_macros.hpp"
PLUGINLIB_EXPORT_CLASS(nav2_custom_planner::CustomPlanner, nav2_core::GlobalPlanner)
```

4. 配置`CmakeList.txt`、`custom_planner_plugin.xml`和`package.xml`

```txt
# find dependencies
find_package(ament_cmake REQUIRED)
find_package(pluginlib REQUIRED)
find_package(nav2_core REQUIRED)

include_directories(include)
set(library_name custom_pathplanner_plugin)
add_library(${library_name} SHARED src/nav2_custom_planner.cpp)
ament_target_dependencies(${library_name} pluginlib nav2_core)

install(TARGETS ${library_name}
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin
)
install(DIRECTORY include/
  DESTINATION include/
)

# pluginlib_export_xml
pluginlib_export_plugin_description_file(nav2_core custom_planner_plugin.xml)
```

```xml
<library path="custom_pathplanner_plugin">
    <class name="nav2_custom_planner/CustomPlanner" type="nav2_custom_planner::CustomPlanner" base_class_type="nav2_core::GlobalPlanner">
    <description>CustomPathPlanner</description>
    </class>
</library>
```

```xml
<export>
    <build_type>ament_cmake</build_type>
    <nav2_core plugin="${prefix}/custom_planner_plugin.xml" />
  </export>
```

5. 加入导航配置`nav2_params.yaml`中

```yaml
planner_server:
  ros__parameters:
    expected_planner_frequency: 20.0
    use_sim_time: True
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_custom_planner/CustomPlanner"
      # 也可以以使用 type 属性 nav2_custom_planner::CustomPlanner
      interpolation_resolution: 0.1
```



## 控制器Plugin

1. 依赖于`nav2_core`

```bash
ros2 pkg create nav2_custom_controller --dependencies pluginlib nav2_core
```

2. `[package_name]/include/[package_name]`下编写插件`nav2_custom_controller.hpp`，即`nav2_core::Controller`子类编写规范

```cpp
#ifndef NAV2_CUSTOM_CONTROLLER__NAV2_CUSTOM_CONTROLLER_HPP_
#define NAV2_CUSTOM_CONTROLLER__NAV2_CUSTOM_CONTROLLER_HPP_

#include <memory>
#include <string>
#include <vector>

#include "nav2_core/controller.hpp"
#include "rclcpp/rclcpp.hpp"
#include "nav2_util/robot_utils.hpp"

namespace nav2_custom_controller {

    class CustomController : public nav2_core::Controller {
    public:
        CustomController() = default;
        ~CustomController() override = default;

        void configure(
            const rclcpp_lifecycle::LifecycleNode::WeakPtr &parent, std::string name,
            std::shared_ptr<tf2_ros::Buffer> tf,
            std::shared_ptr<nav2_costmap_2d::Costmap2DROS> costmap_ros) override;
        void cleanup() override;
        void activate() override;
        void deactivate() override;
        geometry_msgs::msg::TwistStamped
        computeVelocityCommands(const geometry_msgs::msg::PoseStamped &pose,
                                const geometry_msgs::msg::Twist &velocity,
                                nav2_core::GoalChecker * goal_checker) override;
        void setPlan(const nav_msgs::msg::Path &path) override;
        void setSpeedLimit(const double &speed_limit,
                            const bool &percentage) override;

    protected:
        // 存储插件名称
        std::string plugin_name_;
        // 存储坐标变换缓存指针，可用于查询坐标关系
        std::shared_ptr<tf2_ros::Buffer> tf_;
        // 存储代价地图
        std::shared_ptr<nav2_costmap_2d::Costmap2DROS> costmap_ros_;
        // 存储节点指针
        nav2_util::LifecycleNode::SharedPtr node_;
        // 参数：最大线速度角速度
        double max_angular_speed_;
        double max_linear_speed_;

        // 存储全局代价地图
        nav2_costmap_2d::Costmap2D *costmap_;
        // 存储 setPlan 提供的全局路径
        nav_msgs::msg::Path global_plan_;
        // 获取路径中距离当前点最近的点
        geometry_msgs::msg::PoseStamped
        getNearestTargetPose(const geometry_msgs::msg::PoseStamped &current_pose);
        // 计算目标点方向和当前位置的角度差
        double
        calculateAngleDifference(const geometry_msgs::msg::PoseStamped &current_pose,
                                const geometry_msgs::msg::PoseStamped &target_pose);
    };

}

#endif // NAV2_CUSTOM_CONTROLLER__NAV2_CUSTOM_CONTROLLER_HPP_
```

3. `[package_name]/src`下编写插件`nav2_custom_controller.cpp`，即子类定义

```cpp
#include "nav2_custom_controller/nav2_custom_controller.hpp" 
#include "nav2_core/exceptions.hpp"
#include "nav2_util/geometry_utils.hpp"
#include "nav2_util/node_utils.hpp"
#include <algorithm>
#include <chrono>
#include <iostream>
#include <memory>
#include <string>
#include <thread>

// plugin_name_、node_、tf_、costmap_ros_、max_linear_speed、max_angular_speed
// 
namespace nav2_custom_controller
{

    void CustomController::configure(const rclcpp_lifecycle::LifecycleNode::WeakPtr &parent, std::string name,
        std::shared_ptr<tf2_ros::Buffer> tf, std::shared_ptr<nav2_costmap_2d::Costmap2DROS> costmap_ros)
    {
        plugin_name_ = name;
        node_ = parent.lock();
        tf_ = tf;
        costmap_ros_ = costmap_ros;
        // 声明并获取参数，设置最大线速度和最大角速度
        nav2_util::declare_parameter_if_not_declared(
            node_, plugin_name_ + ".max_linear_speed", rclcpp::ParameterValue(0.1));
        node_->get_parameter(plugin_name_ + ".max_linear_speed", max_linear_speed_);
        nav2_util::declare_parameter_if_not_declared(
            node_, plugin_name_ + ".max_angular_speed", rclcpp::ParameterValue(1.0));
        node_->get_parameter(plugin_name_ + ".max_angular_speed", max_angular_speed_);
    }

    void CustomController::cleanup() 
    {
        RCLCPP_INFO(node_->get_logger(), "清理控制器：%s 类型为 nav2_custom_controller::CustomController", plugin_name_.c_str());
    }

    void CustomController::activate() 
    {
        RCLCPP_INFO(node_->get_logger(), "激活控制器：%s 类型为 nav2_custom_controller::CustomController", plugin_name_.c_str());
    }

    void CustomController::deactivate() 
    {
        RCLCPP_INFO(node_->get_logger(), "停用控制器：%s 类型为 nav2_custom_controller::CustomController", plugin_name_.c_str());
    }

    geometry_msgs::msg::TwistStamped CustomController::computeVelocityCommands(
        const geometry_msgs::msg::PoseStamped &pose,
        const geometry_msgs::msg::Twist &, nav2_core::GoalChecker *) {
        // 1. 检查路径是否为空
        if (global_plan_.poses.empty()) {
            throw nav2_core::PlannerException("收到长度为零的路径");
        }

        // 2.将机器人当前姿态转换到全局计划坐标系中
        geometry_msgs::msg::PoseStamped pose_in_globalframe;
        if (!nav2_util::transformPoseInTargetFrame(
                pose, pose_in_globalframe, *tf_, global_plan_.header.frame_id, 0.1)) {
            throw nav2_core::PlannerException("无法将机器人姿态转换为全局计划的坐标系");
        }

        // 3.获取最近的目标点和计算角度差
        auto target_pose = getNearestTargetPose(pose_in_globalframe);
        auto angle_diff = calculateAngleDifference(pose_in_globalframe, target_pose);

        // 4.根据角度差计算线速度和角速度
        geometry_msgs::msg::TwistStamped cmd_vel;
        cmd_vel.header.frame_id = pose_in_globalframe.header.frame_id;
        cmd_vel.header.stamp = node_->get_clock()->now();
        // 根据角度差计算速度，角度差大于 0.3 则原地旋转，否则直行
        if (fabs(angle_diff) > M_PI/10.0) {
            cmd_vel.twist.linear.x = .0;
            cmd_vel.twist.angular.z = fabs(angle_diff) / angle_diff * max_angular_speed_;
        } else {
            cmd_vel.twist.linear.x = max_linear_speed_;
            cmd_vel.twist.angular.z = .0;
        }
        RCLCPP_INFO(node_->get_logger(), "控制器：%s 发送速度(%f,%f)",
                    plugin_name_.c_str(), cmd_vel.twist.linear.x,
                    cmd_vel.twist.angular.z);
        return cmd_vel;
    }

    void CustomController::setSpeedLimit(const double &speed_limit,
                                        const bool &percentage) {
        (void)percentage;
        (void)speed_limit;
    }

    void CustomController::setPlan(const nav_msgs::msg::Path &path) {
        global_plan_ = path;
    }

    geometry_msgs::msg::PoseStamped CustomController::getNearestTargetPose(
        const geometry_msgs::msg::PoseStamped &current_pose) {
        // 1.遍历路径获取路径中距离当前点最近的索引，存储到 nearest_pose_index
        using nav2_util::geometry_utils::euclidean_distance;
        int nearest_pose_index = 0;
        double min_dist = euclidean_distance(current_pose, global_plan_.poses.at(0));
        for (unsigned int i = 1; i < global_plan_.poses.size(); i++) {
            double dist = euclidean_distance(current_pose, global_plan_.poses.at(i));
            if (dist < min_dist) {
                nearest_pose_index = i;
                min_dist = dist;
            }
        }
        // 2.从路径中擦除头部到最近点的路径
        global_plan_.poses.erase(std::begin(global_plan_.poses),
                                std::begin(global_plan_.poses) + nearest_pose_index);
        // 3.如果只有一个点则直接，否则返回最近点的下一个点
        if (global_plan_.poses.size() == 1) {
            return global_plan_.poses.at(0);
        }
        return global_plan_.poses.at(1);
    }

    double CustomController::calculateAngleDifference(
        const geometry_msgs::msg::PoseStamped &current_pose,
        const geometry_msgs::msg::PoseStamped &target_pose) {
        // 计算当前姿态与目标姿态之间的角度差
        // 1. 获取当前角度
        float current_robot_yaw = tf2::getYaw(current_pose.pose.orientation);
        // 2.获取目标点朝向
        float target_angle =
            std::atan2(target_pose.pose.position.y - current_pose.pose.position.y,
                        target_pose.pose.position.x - current_pose.pose.position.x);
        // 3.计算角度差，并转换到 -M_PI 到 M_PI 之间
        double angle_diff = target_angle - current_robot_yaw;
        if (angle_diff < -M_PI) {
            angle_diff += 2.0 * M_PI;
        } else if (angle_diff > M_PI) {
            angle_diff -= 2.0 * M_PI;
        }
        return angle_diff;
    }

}

#include "pluginlib/class_list_macros.hpp"
PLUGINLIB_EXPORT_CLASS(nav2_custom_controller::CustomController, nav2_core::Controller)
```

4. 配置`CmakeList.txt`、`custom_planner_plugin.xml`和`package.xml`

```txt
# find dependencies
find_package(ament_cmake REQUIRED)
find_package(pluginlib REQUIRED)
find_package(nav2_core REQUIRED)

include_directories(include)
set(library_name custom_controller_plugin)
add_library(${library_name} SHARED src/nav2_custom_controller.cpp)
ament_target_dependencies(${library_name} pluginlib nav2_core)

install(TARGETS ${library_name}
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin
)
install(DIRECTORY include/
  DESTINATION include/
)

# pluginlib_export_xml
pluginlib_export_plugin_description_file(nav2_core custom_controller_plugin.xml)
```

```xml
<library path="custom_controller_plugin">
    <class name="nav2_custom_controller/CustomController" type="nav2_custom_controller::CustomController" base_class_type="nav2_core::Controller">
    <description>CustomController</description>
    </class>
</library>
```

```xml
<export>
    <build_type>ament_cmake</build_type>
    <nav2_core plugin="${prefix}/custom_controller_plugin.xml" />
  </export>
```

5. 加入导航配置`nav2_params.yaml`中

```yaml
controller_server:
  ros__parameters:
  	...
    FollowPath:
      plugin: "robot_navigation/CustomController"
      max_linear_speed: 0.1
      max_angular_speed: 1.0
```


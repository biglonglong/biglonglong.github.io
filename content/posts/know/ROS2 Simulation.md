---
draft: false

title: "ROS2 Simulation"
description: "完整工具链————从仿真到导航"
date: 2024-01-09
author: ["biglonglong"]

tags: ["summary", "ros2", "gazebo", "navigation"]
summary: ""

math: false
weight: 1
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

## 在开始之前\.\.\.

经过第一轮 ROS2 入门的学习，基本掌握了如何在各节点之间进行信息通信，但要构建一个完整的机器人系统仍有很长的路要走。

“机器人是一种高度复杂的系统性实现，机器人设计包含了机械结构设计、机械加工、硬件设计、嵌入式软件设计、上层软件设计等诸多模块，是各种硬件与软件的有机结合，甚至可以说机器人系统是当今工业体系的集大成者。机器人体系是相当庞大的，其复杂度之高，以至于没有任何个人、组织甚至公司能够独立完成系统性的机器人研发生产任务。

一种更合适的策略是：让机器人研发者专注于自己擅长的领域，其他模块则直接复用相关领域更专业研发团队的实现，当然自身的研究也可以被他人继续复用。这种基于“复用”的分工协作，遵循了不重复发明轮子的原则，显然是可以大大提高机器人的研发效率的，尤其是随着机器人硬件越来越丰富，软件库越来越庞大，这种复用性和模块化开发需求也愈发强烈。”

因此，接下来，我们需要具备调用功能包搭建机器人软件层的能力，再进一步，是深入自己感兴趣的领域，研究底层算法以优化机器人系统性能！到这里，[鱼香ROS机器人](https://fishros.com/)是一个不错的参考，当然，还包括ROS2的各个社区。

- [Welcome to ROS 2 workshop! — ROS 2 workshop documentation](https://ros2-industrial-workshop.readthedocs.io/en/latest/)



## 建模与仿真

通过这一节对机器人的建模与仿真，我们可以得到机器人结构关系、机器人控制以及传感器信息，

![](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/robot_rosgraph.png)

为之后 讨论如何根据机器人结构关系和传感器信息来控制机器人完成任务 做准备

### urdf：机器人建模


```python
from launch import LaunchDescription
from launch_ros.actions import Node
import os
from ament_index_python.packages import get_package_share_directory
from launch_ros.parameter_descriptions import ParameterValue
from launch.substitutions import Command,LaunchConfiguration
from launch.actions import DeclareLaunchArgument,IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.actions import ExecuteProcess
from launch.event_handlers import OnProcessExit
from launch.actions import RegisterEventHandler

def generate_launch_description():
    default_package_dir = get_package_share_directory("urdfDemo")
    default_rviz_path = os.path.join(default_package_dir,"rviz","config.rviz")
    default_model_path = os.path.join(default_package_dir,"urdf/xacro","model.xacro")
    default_world_path = os.path.join(default_package_dir,"worlds","room.world")

    model = DeclareLaunchArgument(name="model", default_value=default_model_path)
    world = DeclareLaunchArgument(name="world", default_value=default_world_path)
    
    # robot_state_publisher
    robot_description = ParameterValue(Command(["xacro ",LaunchConfiguration("model")]), value_type=str)
    robot_state_publisher = Node(
        package="robot_state_publisher",
        executable="robot_state_publisher",
        parameters=[{"robot_description": robot_description}]
    )

    joint_state_publisher = Node(
        package="joint_state_publisher",
        executable="joint_state_publisher"
    )

    rviz2 = Node(
        package="rviz2",
        executable="rviz2",
        arguments=["-d", default_rviz_path]
    )

    action_launch_gazebo = IncludeLaunchDescription(
        launch_description_source = PythonLaunchDescriptionSource(
            launch_file_path=os.path.join(
                get_package_share_directory("gazebo_ros"),
                "launch",
                "gazebo.launch.py"
            )
        ),
        launch_arguments = {
            "world": LaunchConfiguration("world"),
            "verbose": "true",
        }.items()
    )

    action_spawn_entity = Node(
        package="gazebo_ros",
        executable="spawn_entity.py",
        arguments=["-topic", "/robot_description", "-entity", "model", ]
    )

    action_load_joint_state_controller = ExecuteProcess(
        cmd=["ros2 control load_controller robot_joint_state_broadcaster --set-state active"],
        output="both",
        shell=True
    )

    action_load_effort_controller = ExecuteProcess(
        cmd=["ros2 control load_controller robot_effort_controller --set-state active"],
        output="both",
        shell=True
    )

    return LaunchDescription([
        model,
        world,
        robot_state_publisher,
        # joint_state_publisher,
        action_launch_gazebo,
        action_spawn_entity,
        RegisterEventHandler(
            event_handler=OnProcessExit(
                target_action = action_spawn_entity,
                on_exit = [action_load_joint_state_controller],
            )
        ),
        RegisterEventHandler(
            event_handler=OnProcessExit(
                target_action = action_load_joint_state_controller,
                on_exit = [action_load_effort_controller],
            )
        ),
        # rviz2,
    ])
# 几个要注意的点：
# - 可在~/.gazebo载入gazebo模型仿真
# - robot_state_publisher发布机器人固定关节部件frame和静态tf，活动关节部件需要joint_state_publisher发布动态tf。然而，Gazebo中自发布joint_states，且活动关节需要配置，与joint_state_publisher冲突
# - frame建议使用常用名称，因为功能包内部可能存在多处引用
```

```bash
ros2 launch [package] display.launch.py model:=`ros2 pkg prefix --share [package]`/urdf/urdf/robot.urdf
```

#### urdf

> - `check_urdf`：功能包，检查urdf文件语法，展示urdf机器人结构
> - `urdf_to_graphviz`：功能包，生成urdf机器人结构图

```xml
<?xml version="1.0"?>
<robot name="chassis">
    <link name="base_footprint">
        <visual>
            <geometry>
                <sphere radius="0.001" />
            </geometry>
        </visual>
    </link>

    <link name="base_link">    
        <visual>
            <geometry>
                <cylinder radius="0.1" length="0.08" />
                <!-- <box size="0.3 0.2 0.1" /> -->
                <!-- <sphere radius="1" /> -->
                <!-- <mesh filename="package://[package]/meshes/**.stl" scale="1.0 1.0 1.0"/> -->
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />     <!-- shift & rotate -->
            <material name="base_color">
                <color rgba="1.0 0.5 0.5 0.5" />
            </material>
        </visual>
        <!-- <collision>  -->
        <!-- </collision> -->
    	<!-- <Inertial> -->
    	<!-- </Inertial> -->
    </link>

    <joint name="base2footprint" type="fixed">
        <parent link="base_footprint" />
        <child link="base_link" />
        <origin xyz="0.0 0.0 0.055" rpy="0.0 0.0 0.0" />
        <axis xyz="0 0 0" />
    </joint>

    <link name="left_wheel">
        <visual>
            <geometry>
                <cylinder radius="0.0325" length="0.015" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="1.5708 0.0 0.0" />
            <material name="wheel_color">
                <color rgba="0.0 0.0 0.0 0.5" />
            </material>
        </visual>
    </link>

    <joint name="left2base" type="continuous">
        <parent link="base_link" />
        <child link="left_wheel" />
        <origin xyz="0.0 0.1 -0.0225" rpy="0.0 0.0 0.0" />
        <axis xyz="0 1 0" />
    </joint>

    <link name="right_wheel">
        <visual>
            <geometry>
                <cylinder radius="0.0325" length="0.015" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="1.5708 0.0 0.0" />
            <material name="wheel_color">
                <color rgba="0.0 0.0 0.0 0.5" />
            </material>
        </visual>
    </link>

    <joint name="right2base" type="continuous">
        <parent link="base_link" />
        <child link="right_wheel" />
        <origin xyz="0.0 -0.1 -0.0225" rpy="0.0 0.0 0.0" />
        <axis xyz="0 1 0" />
    </joint>

    <link name="front_wheel">
        <visual>
            <geometry>
                <sphere radius="0.0075" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
            <material name="wheel_color">
                <color rgba="1.0 0.5 0.5 0.5" />
            </material>
        </visual>
    </link>

    <joint name="front2base" type="continuous">
        <parent link="base_link" />
        <child link="front_wheel" />
        <origin xyz="0.08 0.0 -0.0475" rpy="0.0 0.0 0.0" />
        <axis xyz="1 1 1" />
    </joint>

    <link name="back_wheel">
        <visual>
            <geometry>
                <sphere radius="0.0075" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
            <material name="wheel_color">
                <color rgba="1.0 0.5 0.5 0.5" />
            </material>
        </visual>
    </link>

    <joint name="back2base" type="continuous">
        <parent link="base_link" />
        <child link="back_wheel" />
        <origin xyz="-0.08 0.0 -0.0475" rpy="0.0 0.0 0.0" />
        <axis xyz="1 1 1" />
    </joint>
</robot>
```

#### xacro

> - `xacro`：功能包，转化xacro文件为urdf文件
> - collision：子标签，如果机器人link是标准的几何体形状，和link的 visual 属性设置一致即可
> - inertial：子标签，惯性矩阵需结合link的质量与外形参数动态生成，标准球体、圆柱与立方体的惯性矩阵公式封装在inertialhead.xacro
> - gazebo：子标签，配置gazebo颜色、摩擦、刚度系数等等，**添加各传感器的仿真插件**（具体见[gazebo：环境仿真](# gazebo：环境仿真)）

```xml
<robot name="model" xmlns:xacro="http://wiki.ros.org/xacro">
    <xacro:include filename="inertialhead.xacro" />
    <xacro:include filename="base.xacro" />
    <xacro:include filename="camera.xacro" />
    <xacro:include filename="laser.xacro" />

    <xacro:include filename="plugins/move.xacro" />
    <!-- <xacro:gazebo_control_plugin  /> -->
    <xacro:include filename="ros2_control.xacro" /> 
    <xacro:robot_ros2_control />
    
    <xacro:include filename="plugins/laser.xacro" />
    <xacro:gazebo_laser_plugin />
    <xacro:include filename="plugins/imu.xacro" />
    <xacro:gazebo_imu_plugin />
    <xacro:include filename="plugins/camera.xacro" />
    <xacro:gazebo_camera_plugin />
</robot>
```

```xml
<robot name="inertialhead" xmlns:xacro="http://wiki.ros.org/xacro">
<!-- macrofunc -->
    <xacro:macro name="sphere_inertial_matrix" params="m r">
        <inertial>
            <mass value="${m}" />
            <inertia ixx="${2*m*r*r/5}" ixy="0" ixz="0"
                iyy="${2*m*r*r/5}" iyz="0" 
                izz="${2*m*r*r/5}" />
        </inertial>
    </xacro:macro>

    <xacro:macro name="cylinder_inertial_matrix" params="m r h">
        <inertial>
            <mass value="${m}" />
            <inertia ixx="${m*(3*r*r+h*h)/12}" ixy = "0" ixz = "0"
                iyy="${m*(3*r*r+h*h)/12}" iyz = "0"
                izz="${m*r*r/2}" /> 
        </inertial>
    </xacro:macro>

    <xacro:macro name="Box_inertial_matrix" params="m l w h">
       <inertial>
               <mass value="${m}" />
               <inertia ixx="${m*(h*h + l*l)/12}" ixy = "0" ixz = "0"
                   iyy="${m*(w*w + l*l)/12}" iyz= "0"
                   izz="${m*(w*w + h*h)/12}" />
       </inertial>
   </xacro:macro>
</robot>
```

```xml
<robot name="base" xmlns:xacro="http://wiki.ros.org/xacro">
<!-- property -->
    <xacro:property name="PI" value="3.1415927" />
    <xacro:property name="footprint_radius" value="0.001" />
    <xacro:property name="base_weight" value="2" />
    <xacro:property name="base_radius" value="0.1" />
    <xacro:property name="base_length" value="0.08" />
    <xacro:property name="ground_distance" value="0.015" />
    <xacro:property name="joint_base2footprint_z" value="${base_length / 2 + ground_distance}" />
    <xacro:property name="wheel_weight" value="0.05" />
    <xacro:property name="wheel_radius" value="0.0325" />
    <xacro:property name="wheel_length" value="0.015" />
    <xacro:property name="joint_wheel2base_z" value="${(joint_base2footprint_z - wheel_radius) * -1}" />
    <xacro:property name="spinwheel_weight" value="0.03" />
    <xacro:property name="spinwheel_radius" value="0.0075" />
    <xacro:property name="joint_spinwheel2base_z" value="${(joint_base2footprint_z - spinwheel_radius) * -1}" />

<!-- macrofunc -->
    <xacro:macro name="wheel_func" params="wheel_name flag" >
        <link name="${wheel_name}_wheel">
            <visual>
                <geometry>
                    <cylinder radius="${wheel_radius}" length="${wheel_length}" />
                    <!-- <cylinder radius="${}" length="${}" /> -->
                    <!-- <box size="${} ${} ${}" /> -->
                    <!-- <sphere radius="${}" /> -->
                    <!-- <mesh filename="package://simulation/meshes/autolabor_mini.stl" /> -->
                </geometry>
                <origin xyz="0.0 0.0 0.0" rpy="${PI / 2} 0.0 0.0" />
                <material name="wheel_color">
                    <color rgba="0.0 0.0 0.0 0.5" />
                </material>
            </visual>
            <collision>
                <geometry>
                    <cylinder radius="${wheel_radius}" length="${wheel_length}" />
                </geometry>
                <origin xyz="0.0 0.0 0.0" rpy="${PI / 2} 0.0 0.0" />
            </collision>
            <xacro:cylinder_inertial_matrix m="${wheel_weight}" r="${wheel_radius}" h="${wheel_length}" />
        </link>
        <gazebo reference="${wheel_name}_wheel">			
            <material>Gazebo/Black</material>  <!-- gazebo color -->
            <!-- <mu1 value="20.0"/> -->
            <!-- <mu2 value="20.0"/> -->
            <!-- <kp value="100000000.0"/> -->
            <!-- <kd value="1.0"/> -->
        </gazebo>    
        <joint name="${wheel_name}2base" type="continuous">
            <parent link="base_link"  />
            <child link="${wheel_name}_wheel" />
            <origin xyz="0.0 ${0.1 * flag} ${joint_wheel2base_z}" rpy="0.0 0.0 0.0" />
            <axis xyz="0 1 0" />
        </joint>
    </xacro:macro>

    <xacro:macro name="spinwheel_func" params="spinwheel_name flag" >
        <link name="${spinwheel_name}_wheel">
            <visual>
                <geometry>
                    <sphere radius="${spinwheel_radius}" />
                </geometry>
                <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
                <material name="wheel_color">
                    <color rgba="1.0 0.5 0.5 0.5" />
                </material>
            </visual>
            <collision>
                <geometry>
                    <sphere radius="${spinwheel_radius}" />
                </geometry>
                <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />   
            </collision>
            <xacro:sphere_inertial_matrix m="${spinwheel_weight}" r="${spinwheel_radius}" />
        </link>
        <gazebo reference="${spinwheel_name}_wheel">
            <material>Gazebo/Black</material>
        </gazebo>
        <joint name="${spinwheel_name}2base" type="continuous">
            <parent link="base_link" />
            <child link="${spinwheel_name}_wheel" />
            <origin xyz="${0.08 * flag} 0.0 ${joint_spinwheel2base_z}" rpy="0.0 0.0 0.0" />
            <axis xyz="1 1 1" />
        </joint>
    </xacro:macro>

<!-- xacro2urdf -->
    <link name="base_footprint">
        <visual>
            <geometry>
                <sphere radius="${footprint_radius}" />
            </geometry>
        </visual>
    </link>

    <link name="base_link">
        <visual>
            <geometry>
                <cylinder radius="${base_radius}" length="${base_length}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
            <material name="base_color">
                <color rgba="1.0 0.5 0.5 0.5" />
            </material>
        </visual>
        <collision>
            <geometry>
                <cylinder radius="${base_radius}" length="${base_length}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
        </collision>
        <xacro:cylinder_inertial_matrix m="${base_weight}" r="${base_radius}" h="${base_length}" />
    </link>

    <gazebo reference="base_link">
        <material>Gazebo/Green</material>
    </gazebo>

    <joint name="base2footprint" type="fixed">
        <parent link="base_footprint" />
        <child link="base_link" />
        <origin xyz="0.0 0.0 ${joint_base2footprint_z}" rpy="0.0 0.0 0.0" />
        <axis xyz="0 0 0" />
    </joint>

    <xacro:wheel_func wheel_name="left" flag="1" />
    <xacro:wheel_func wheel_name="right" flag="-1" />

    <xacro:spinwheel_func spinwheel_name="front" flag="1" />
    <xacro:spinwheel_func spinwheel_name="back" flag="-1" />

</robot>
```

```xml
<robot name="laser" xmlns:xacro="http://wiki.ros.org/xacro">
<!-- property -->
    <xacro:property name="support_weight" value="0.02" />
    <xacro:property name="support_radius" value="0.01" />
    <xacro:property name="support_length" value="0.15" />
    <xacro:property name="laser_weight" value="0.1" />
    <xacro:property name="laser_radius" value="0.03" />
    <xacro:property name="laser_length" value="0.05" />
    <xacro:property name="joint_support2base_x" value="0.0" />
    <xacro:property name="joint_support2base_y" value="0.0" />
    <xacro:property name="joint_support2base_z" value="${base_length / 2 + support_length / 2}" />
    <xacro:property name="joint_laser2support_x" value="0.0" />
    <xacro:property name="joint_laser2support_y" value="0.0" />
    <xacro:property name="joint_laser2support_z" value="${support_length / 2 + laser_length / 2}" />

<!-- xacro2urdf -->
    <link name="support">
        <visual>
            <geometry>
                <cylinder radius="${support_radius}" length="${support_length}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
            <material name="support_color">
                <color rgba="0.5 1.0 0.5 1.0" />
            </material>
        </visual>
        <collision>
            <geometry>
                <cylinder radius="${support_radius}" length="${support_length}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
        </collision>
        <xacro:cylinder_inertial_matrix m="${support_weight}" r="${support_radius}" h="${support_length}" />
    </link>

    <gazebo reference="support">
        <material>Gazebo/Orange</material>
    </gazebo>

    <joint name="support2base" type="fixed">
        <parent link="base_link" />
        <child link="support" />
        <origin xyz="${joint_support2base_x} ${joint_support2base_y} ${joint_support2base_z}" rpy="0.0 0.0 0.0" />
    </joint>

    <link name="laser">
        <visual>
            <geometry>
                <cylinder radius="${laser_radius}" length="${laser_length}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
            <material name="laser_color">
                <color rgba="0.5 0.5 1.0 1.0" />
            </material>
        </visual>
        <collision>
            <geometry>
                <cylinder radius="${laser_radius}" length="${laser_length}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
        </collision>
        <xacro:cylinder_inertial_matrix m="${laser_weight}" r="${laser_radius}" h="${laser_length}" />
    </link>

    <gazebo reference="laser">
        <material>Gazebo/Red</material>
    </gazebo>

    <joint name="laser2support" type="fixed">
        <parent link="support" />
        <child link="laser" />
        <origin xyz="${joint_laser2support_x} ${joint_laser2support_y} ${joint_laser2support_z}" rpy="0.0 0.0 0.0" />
    </joint>

</robot>
```

```xml
<robot name="camera" xmlns:xacro="http://wiki.ros.org/xacro">
<!-- property -->
    <xacro:property name="camera_weight" value="0.01" />
    <xacro:property name="camera_length" value="0.02" />
    <xacro:property name="camera_width" value="0.05" />
    <xacro:property name="camera_height" value="0.05" />
    <xacro:property name="joint_camera_x" value="0.08" />
    <xacro:property name="joint_camera_y" value="0.0" />
    <xacro:property name="joint_camera_z" value="${base_length / 2 + camera_height / 2}" />
    <xacro:property name="PI" value="3.1415927" />

<!-- xacro2urdf -->
    <link name="camera">
        <visual>
            <geometry>
                <box size="${camera_length} ${camera_width} ${camera_height}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
            <material name="camera_color">
                <color rgba="0.5 0.5 0.5 0.5" />
            </material>
        </visual>
        <collision>
            <geometry>
                <box size="${camera_length} ${camera_width} ${camera_height}" />
            </geometry>
            <origin xyz="0.0 0.0 0.0" rpy="0.0 0.0 0.0" />
        </collision>
        <xacro:Box_inertial_matrix m="${camera_weight}" l="${camera_length}" w="${camera_width}" h="${camera_height}" />
    </link>

    <gazebo reference="camera">
        <material>Gazebo/White</material>
    </gazebo>

    <joint name="camera2base" type="fixed">
        <parent link="base_link" />
        <child link="camera" />
        <origin xyz="${joint_camera_x} ${joint_camera_y} ${joint_camera_z}" rpy="0.0 0.0 0.0" />
    </joint>

    <link name="camera_deep"></link>
    <joint name="camera_deep2camera" type="fixed">
        <parent link="camera" />
        <child link="camera_deep" />
        <origin xyz="0.0 0.0 0.0" rpy="${-PI/2} 0.0 ${-PI/2}" />
    </joint>

</robot>
```

### gazebo：环境仿真

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">
    <xacro:macro name="gazebo_control_plugin">
        <gazebo>
            <plugin name='diff_drive' filename='libgazebo_ros_diff_drive.so'>
                <ros>
                    <namespace>/</namespace>
                    <remapping>cmd_vel:=cmd_vel</remapping>
                    <remapping>odom:=odom</remapping>
                </ros>
                <update_rate>30</update_rate>
                <!-- wheels -->
                <left_joint>left2base</left_joint>
                <right_joint>right2base</right_joint>
                <!-- kinematics -->
                <wheel_separation>0.2</wheel_separation>
                <wheel_diameter>0.064</wheel_diameter>
                <!-- limits -->
                <max_wheel_torque>20</max_wheel_torque>
                <max_wheel_acceleration>1.0</max_wheel_acceleration>
                <!-- output -->
                <publish_odom>true</publish_odom>
                <publish_odom_tf>true</publish_odom_tf>
                <publish_wheel_tf>true</publish_wheel_tf>

                <odometry_frame>odom</odometry_frame>
                <robot_base_frame>base_footprint</robot_base_frame>
            </plugin>
        </gazebo>
   </xacro:macro>
</robot>
```

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">
    <xacro:macro name="gazebo_laser_plugin">
        <gazebo reference="laser">
            <sensor name="laserscan" type="ray">
                <plugin name="laserscan" filename="libgazebo_ros_ray_sensor.so">
                    <ros>
                        <namespace>/</namespace>
                        <remapping>~/out:=scan</remapping>
                    </ros>
                    <output_type>sensor_msgs/LaserScan</output_type>
                    <frame_name>laser</frame_name>
                </plugin>

                <always_on>true</always_on>
                <visualize>true</visualize>
                <update_rate>5</update_rate>
                <pose>0 0 0 0 0 0</pose>
				<!-- 激光传感器配置 -->
                <ray>
                    <!-- 设置扫描范围 -->
                    <scan>
                        <horizontal>
                            <samples>360</samples>
                            <resolution>1.000000</resolution>
                            <min_angle>0.000000</min_angle>
                            <max_angle>6.280000</max_angle>
                        </horizontal>
                    </scan>
                    <!-- 设置扫描距离 -->
                    <range>
                        <min>0.120000</min>
                        <max>8.0</max>
                        <resolution>0.015000</resolution>
                    </range>
                    <!-- 设置噪声 -->
                    <noise>
                        <type>gaussian</type>
                        <mean>0.0</mean>
                        <stddev>0.01</stddev>
                    </noise>
                </ray>
            </sensor>
        </gazebo>
   </xacro:macro>
</robot>
```

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">
    <xacro:macro name="gazebo_imu_plugin">
        <gazebo reference="support">
            <sensor name="imu_sensor" type="imu">
                <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so">
                    <ros>
                        <namespace>/</namespace>
                        <remapping>~/out:=imu</remapping>
                    </ros>
                    <initial_orientation_as_reference>false</initial_orientation_as_reference>
                </plugin>
                <update_rate>100</update_rate>
                <always_on>true</always_on>
                <!-- 六轴噪声设置 -->
                <imu>
                    <angular_velocity>
                        <x>
                            <noise type="gaussian">
                                <mean>0.0</mean>
                                <stddev>2e-4</stddev>
                                <bias_mean>0.0000075</bias_mean>
                                <bias_stddev>0.0000008</bias_stddev>
                            </noise>
                        </x>
                        <y>
                            <noise type="gaussian">
                                <mean>0.0</mean>
                                <stddev>2e-4</stddev>
                                <bias_mean>0.0000075</bias_mean>
                                <bias_stddev>0.0000008</bias_stddev>
                            </noise>
                        </y>
                        <z>
                            <noise type="gaussian">
                                <mean>0.0</mean>
                                <stddev>2e-4</stddev>
                                <bias_mean>0.0000075</bias_mean>
                                <bias_stddev>0.0000008</bias_stddev>
                            </noise>
                        </z>
                    </angular_velocity>
                    <linear_acceleration>
                        <x>
                            <noise type="gaussian">
                                <mean>0.0</mean>
                                <stddev>1.7e-2</stddev>
                                <bias_mean>0.1</bias_mean>
                                <bias_stddev>0.001</bias_stddev>
                            </noise>
                        </x>
                        <y>
                            <noise type="gaussian">
                                <mean>0.0</mean>
                                <stddev>1.7e-2</stddev>
                                <bias_mean>0.1</bias_mean>
                                <bias_stddev>0.001</bias_stddev>
                            </noise>
                        </y>
                        <z>
                            <noise type="gaussian">
                                <mean>0.0</mean>
                                <stddev>1.7e-2</stddev>
                                <bias_mean>0.1</bias_mean>
                                <bias_stddev>0.001</bias_stddev>
                            </noise>
                        </z>
                    </linear_acceleration>
                </imu>
            </sensor>
        </gazebo>
   </xacro:macro>
</robot>
```

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">
    <xacro:macro name="gazebo_camera_plugin">
        <gazebo reference="camera">
            <sensor type="depth" name="camera_sensor">
                <plugin name="depth_camera" filename="libgazebo_ros_camera.so">
                    <frame_name>camera_deep</frame_name>
                </plugin>
                <always_on>true</always_on>
                <update_rate>10</update_rate>
                <camera name="camera">
                    <horizontal_fov>1.5009831567</horizontal_fov>
                    <image>
                        <width>800</width>
                        <height>600</height>
                        <format>R8G8B8</format>
                    </image>
                    <distortion>
                        <k1>0.0</k1>
                        <k2>0.0</k2>
                        <k3>0.0</k3>
                        <p1>0.0</p1>
                        <p2>0.0</p2>
                        <center>0.5 0.5</center>
                    </distortion>
                </camera>
            </sensor>
        </gazebo>
   </xacro:macro>
</robot>
```

#### ros2_control

一个控制器框架，封装了数据接口和控制器算法，用于硬件集成—**实体机器人的传感器与机器人tf**的配置。与上面的gazebo插件具有类似的作用，只是数据接口做了统一

![](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/robot_ros2_control.jpg)

框架下常用的控制器管理命令：

```bash
# 框架下所有的控制器
ros2 control list_controller_types 
# 框架下正在运行的数据接口
ros2 control list_hardware_interfaces
# 框架下正在运行的硬件组件
ros2 control list_hardware_components
# 加载控制器
ros2 control load_cntroller [cntroller_name] --set-state active
# 框架下已加载的控制器
ros2 control list_controllers
# 设置已加载的控制器状态
ros2 control set_controller_state [cntroller_name] inactive|active
# 卸载控制器
ros2 control unload_controller [cntroller_name]
```

`gazebo_ros2_control`，提供符合控制器数据接口的数据：

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">
    <xacro:macro name="robot_ros2_control">
        <ros2_control name="RobotGazeboSystem" type="system">
            <hardware>
                <plugin>gazebo_ros2_control/GazeboSystem</plugin>
            </hardware>
            <joint name="left2base">
                <command_interface name="velocity">
                    <param name="min">-1</param>
                    <param name="max">1</param>
                </command_interface>
                <command_interface name="effort">
                    <param name="min">-0.1</param>
                    <param name="max">0.1</param>
                </command_interface>
                <state_interface name="position" />
                <state_interface name="velocity" />
                <state_interface name="effort" />
            </joint>
            <joint name="right2base">
                <command_interface name="velocity">
                    <param name="min">-1</param>
                    <param name="max">1</param>
                </command_interface>
                <command_interface name="effort">
                    <param name="min">-0.1</param>
                    <param name="max">0.1</param>
                </command_interface>
                <state_interface name="position" />
                <state_interface name="velocity" />
                <state_interface name="effort" />
            </joint>
        </ros2_control>
        <gazebo>
            <plugin filename="libgazebo_ros2_control.so" name="gazebo_ros2_control">
                <parameters>$(find urdfDemo)/config/robot_ros2_controller.yaml</parameters>
                <ros>
                    <remapping>/robot_diff_drive_controller/cmd_vel_unstamped:=/cmd_vel</remapping>
                    <remapping>/robot_diff_drive_controller/odom:=/odom</remapping>
                </ros>
            </plugin>
        </gazebo>
    </xacro:macro>
</robot>
```

`ros2_control`要求启动的控制器：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz
    use_sim_time: true

    robot_joint_state_broadcaster:
      type: joint_state_broadcaster/JointStateBroadcaster
    robot_effort_controller:
      type: effort_controllers/JointGroupEffortController
    robot_diff_drive_controller:
      type: diff_drive_controller/DiffDriveController
    
robot_effort_controller:
  ros__parameters:
    joints:
      - left2base
      - right2base
    command_interfaces:
      - effort
    state_interfaces:
      - position
      - velocity
      - effort

robot_diff_drive_controller:
  ros__parameters:
    left_wheel_names: ["left2base"]
    right_wheel_names: ["right2base"]

    wheel_separation: 0.20
    #wheels_per_side: 1  # actually 2, but both are controlled by 1 signal
    wheel_radius: 0.032

    wheel_separation_multiplier: 1.0
    left_wheel_radius_multiplier: 1.0
    right_wheel_radius_multiplier: 1.0

    publish_rate: 50.0
    odom_frame_id: odom
    base_frame_id: base_footprint
    pose_covariance_diagonal : [0.001, 0.001, 0.0, 0.0, 0.0, 0.01]
    twist_covariance_diagonal: [0.001, 0.0, 0.0, 0.0, 0.0, 0.01]

    open_loop: true
    enable_odom_tf: true

    cmd_vel_timeout: 0.5
    #publish_limited_velocity: true
    use_stamped_vel: false
    #velocity_rolling_window_size: 10
```

仿真后tf

![](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/robot_frames.png)



## SLAM

即时**定位**与**地图构建**，使机器人在未知环境中通过传感器（如激光雷达、摄像头、IMU、超声波传感器和GPS），进行数据采集、特征提取、数据关联、位置估计和地图更新，从而构建环境地图并确定自身位置

- `map.yaml`，保存地图的配置：

|                 | 单位为m                                               |
| --------------- | ----------------------------------------------------- |
| image           | 图像名称                                              |
| mode            | 图像模式，trinary(三进制)/scale(缩放的)/raw(原本的值) |
| resolution      | 分辨率，一个栅格对应的物理尺寸                        |
| origin          | 机器人原点坐标系下地图原点位置                        |
| negate          | 是否反转图像                                          |
| cooupied_thresh | 占据阈值                                              |
| free_thresh     | 空闲阈值                                              |

- `slam-toolbox`  

```bash
# 启动机器人仿真
ros2 launch slam_toolbox online_async_launch.py use_sim_time:=true				# 建图
ros2 run teleop_twist_keyboard teleop_twist_keyboard 							# 控制运动
ros2 run nav2_map_server map_saver_cli -f map									# 保存地图
```

- `cartographer`



## Navigation

导航框架，基于SLAM、目标点、激光雷达和摄像头，提供**路径规划**、**路径跟踪**、**障碍物避**让和**恢复行为**等功能，使机器人能够在复杂环境中根据**目标点/路点/障碍物**实现自主导航

- `Navagation 2`

![](https://ros2-industrial-workshop.readthedocs.io/en/latest/_images/navigation_overview.png)

**使用说明参考nav2_bringup**，下面给出其yaml配置

```bash
# topic、frame、robot_radius、controller_server:FollowPath、costmap:inflation_radius、xy_goal_tolerance
# cp /opt/ros/humble/share/nav2_bringup/params/nav2_params.yaml src/robot_navigation/config/
amcl:
  ros__parameters:
    use_sim_time: True
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    alpha5: 0.2
    base_frame_id: "base_footprint"
    beam_skip_distance: 0.5
    beam_skip_error_threshold: 0.9
    beam_skip_threshold: 0.3
    do_beamskip: false
    global_frame_id: "map"
    lambda_short: 0.1
    laser_likelihood_max_dist: 2.0
    laser_max_range: 100.0
    laser_min_range: -1.0
    laser_model_type: "likelihood_field"
    max_beams: 60
    max_particles: 2000
    min_particles: 500
    odom_frame_id: "odom"
    pf_err: 0.05
    pf_z: 0.99
    recovery_alpha_fast: 0.0
    recovery_alpha_slow: 0.0
    resample_interval: 1
    robot_model_type: "nav2_amcl::DifferentialMotionModel"
    save_pose_rate: 0.5
    sigma_hit: 0.2
    tf_broadcast: true
    transform_tolerance: 1.0
    update_min_a: 0.2
    update_min_d: 0.25
    z_hit: 0.5
    z_max: 0.05
    z_rand: 0.5
    z_short: 0.05
    scan_topic: scan

bt_navigator:
  ros__parameters:
    use_sim_time: True
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    wait_for_service_timeout: 1000
    # 'default_nav_through_poses_bt_xml' and 'default_nav_to_pose_bt_xml' are use defaults:
    # nav2_bt_navigator/navigate_to_pose_w_replanning_and_recovery.xml
    # nav2_bt_navigator/navigate_through_poses_w_replanning_and_recovery.xml
    # They can be set here or via a RewrittenYaml remap from a parent launch file to Nav2.
    plugin_lib_names:
      - nav2_compute_path_to_pose_action_bt_node
      - nav2_compute_path_through_poses_action_bt_node
      - nav2_smooth_path_action_bt_node
      - nav2_follow_path_action_bt_node
      - nav2_spin_action_bt_node
      - nav2_wait_action_bt_node
      - nav2_assisted_teleop_action_bt_node
      - nav2_back_up_action_bt_node
      - nav2_drive_on_heading_bt_node
      - nav2_clear_costmap_service_bt_node
      - nav2_is_stuck_condition_bt_node
      - nav2_goal_reached_condition_bt_node
      - nav2_goal_updated_condition_bt_node
      - nav2_globally_updated_goal_condition_bt_node
      - nav2_is_path_valid_condition_bt_node
      - nav2_initial_pose_received_condition_bt_node
      - nav2_reinitialize_global_localization_service_bt_node
      - nav2_rate_controller_bt_node
      - nav2_distance_controller_bt_node
      - nav2_speed_controller_bt_node
      - nav2_truncate_path_action_bt_node
      - nav2_truncate_path_local_action_bt_node
      - nav2_goal_updater_node_bt_node
      - nav2_recovery_node_bt_node
      - nav2_pipeline_sequence_bt_node
      - nav2_round_robin_node_bt_node
      - nav2_transform_available_condition_bt_node
      - nav2_time_expired_condition_bt_node
      - nav2_path_expiring_timer_condition
      - nav2_distance_traveled_condition_bt_node
      - nav2_single_trigger_bt_node
      - nav2_goal_updated_controller_bt_node
      - nav2_is_battery_low_condition_bt_node
      - nav2_navigate_through_poses_action_bt_node
      - nav2_navigate_to_pose_action_bt_node
      - nav2_remove_passed_goals_action_bt_node
      - nav2_planner_selector_bt_node
      - nav2_controller_selector_bt_node
      - nav2_goal_checker_selector_bt_node
      - nav2_controller_cancel_bt_node
      - nav2_path_longer_on_approach_bt_node
      - nav2_wait_cancel_bt_node
      - nav2_spin_cancel_bt_node
      - nav2_back_up_cancel_bt_node
      - nav2_assisted_teleop_cancel_bt_node
      - nav2_drive_on_heading_cancel_bt_node
      - nav2_is_battery_charging_condition_bt_node

bt_navigator_navigate_through_poses_rclcpp_node:
  ros__parameters:
    use_sim_time: True

bt_navigator_navigate_to_pose_rclcpp_node:
  ros__parameters:
    use_sim_time: True

controller_server:
  ros__parameters:
    use_sim_time: True
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    failure_tolerance: 0.3
    progress_checker_plugin: "progress_checker"
    goal_checker_plugins: ["general_goal_checker"] # "precise_goal_checker"
    controller_plugins: ["FollowPath"]

    # Progress checker parameters
    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5
      movement_time_allowance: 10.0
    # Goal checker parameters
    #precise_goal_checker:
    #  plugin: "nav2_controller::SimpleGoalChecker"
    #  xy_goal_tolerance: 0.25
    #  yaw_goal_tolerance: 0.25
    #  stateful: True
    general_goal_checker:
      stateful: True
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25
    # DWB parameters
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      debug_trajectory_details: True
      min_vel_x: 0.0
      min_vel_y: 0.0
      max_vel_x: 0.26
      max_vel_y: 0.0
      max_vel_theta: 1.0
      min_speed_xy: 0.0
      max_speed_xy: 0.26
      min_speed_theta: 0.0
      # Add high threshold velocity for turtlebot 3 issue.
      # https://github.com/ROBOTIS-GIT/turtlebot3_simulations/issues/75
      acc_lim_x: 2.5
      acc_lim_y: 0.0
      acc_lim_theta: 3.2
      decel_lim_x: -2.5
      decel_lim_y: 0.0
      decel_lim_theta: -3.2
      vx_samples: 20
      vy_samples: 5
      vtheta_samples: 20
      sim_time: 1.7
      linear_granularity: 0.05
      angular_granularity: 0.025
      transform_tolerance: 0.2
      xy_goal_tolerance: 0.25
      trans_stopped_velocity: 0.25
      short_circuit_trajectory_evaluation: True
      stateful: True
      critics: ["RotateToGoal", "Oscillation", "BaseObstacle", "GoalAlign", "PathAlign", "PathDist", "GoalDist"]
      BaseObstacle.scale: 0.02
      PathAlign.scale: 32.0
      PathAlign.forward_point_distance: 0.1
      GoalAlign.scale: 24.0
      GoalAlign.forward_point_distance: 0.1
      PathDist.scale: 32.0
      GoalDist.scale: 24.0
      RotateToGoal.scale: 32.0
      RotateToGoal.slowing_factor: 5.0
      RotateToGoal.lookahead_time: -1.0

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: True
      rolling_window: true
      width: 3
      height: 3
      resolution: 0.05
      robot_radius: 0.12
      plugins: ["voxel_layer", "inflation_layer"]
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: True
        publish_voxel_map: True
        origin_z: 0.0
        z_resolution: 0.05
        z_voxels: 16
        max_obstacle_height: 2.0
        mark_threshold: 0
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True
      always_send_full_costmap: True

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      use_sim_time: True
      robot_radius: 0.12
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      always_send_full_costmap: True

map_server:
  ros__parameters:
    use_sim_time: True
    # Overridden in launch by the "map" launch configuration or provided default value.
    # To use in yaml, remove the default "map" value in the tb3_simulation_launch.py file & provide full path to map below.
    yaml_filename: ""

map_saver:
  ros__parameters:
    use_sim_time: True
    save_map_timeout: 5.0
    free_thresh_default: 0.25
    occupied_thresh_default: 0.65
    map_subscribe_transient_local: True

planner_server:
  ros__parameters:
    expected_planner_frequency: 20.0
    use_sim_time: True
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: false
      allow_unknown: true

smoother_server:
  ros__parameters:
    use_sim_time: True
    smoother_plugins: ["simple_smoother"]
    simple_smoother:
      plugin: "nav2_smoother::SimpleSmoother"
      tolerance: 1.0e-10
      max_its: 1000
      do_refinement: True

behavior_server:
  ros__parameters:
    costmap_topic: local_costmap/costmap_raw
    footprint_topic: local_costmap/published_footprint
    cycle_frequency: 10.0
    behavior_plugins: ["spin", "backup", "drive_on_heading", "assisted_teleop", "wait"]
    spin:
      plugin: "nav2_behaviors/Spin"
    backup:
      plugin: "nav2_behaviors/BackUp"
    drive_on_heading:
      plugin: "nav2_behaviors/DriveOnHeading"
    wait:
      plugin: "nav2_behaviors/Wait"
    assisted_teleop:
      plugin: "nav2_behaviors/AssistedTeleop"
    global_frame: odom
    robot_base_frame: base_link
    transform_tolerance: 0.1
    use_sim_time: true
    simulate_ahead_time: 2.0
    max_rotational_vel: 1.0
    min_rotational_vel: 0.4
    rotational_acc_lim: 3.2

robot_state_publisher:
  ros__parameters:
    use_sim_time: True

waypoint_follower:
  ros__parameters:
    use_sim_time: True
    loop_rate: 20
    stop_on_failure: false
    waypoint_task_executor_plugin: "wait_at_waypoint"
    wait_at_waypoint:
      plugin: "nav2_waypoint_follower::WaitAtWaypoint"
      enabled: True
      waypoint_pause_duration: 200

velocity_smoother:
  ros__parameters:
    use_sim_time: True
    smoothing_frequency: 20.0
    scale_velocities: False
    feedback: "OPEN_LOOP"
    max_velocity: [0.26, 0.0, 1.0]
    min_velocity: [-0.26, 0.0, -1.0]
    max_accel: [2.5, 0.0, 3.2]
    max_decel: [-2.5, 0.0, -3.2]
    odom_topic: "odom"
    odom_duration: 0.1
    deadband_velocity: [0.0, 0.0, 0.0]
    velocity_timeout: 1.0
```

下面给出nav2启动launch

```python
# 启动机器人仿真
from launch import LaunchDescription
from launch_ros.actions import Node
import os
from ament_index_python.packages import get_package_share_directory
from launch.substitutions import LaunchConfiguration
from launch.actions import DeclareLaunchArgument,IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource

def generate_launch_description():
    default_package_dir = get_package_share_directory('robot_navigation')
    nav2_bringup_dir = get_package_share_directory('nav2_bringup')
    default_rviz_path = os.path.join(nav2_bringup_dir,'rviz','nav2_default_view.rviz')
    
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    map_yaml_path = LaunchConfiguration('map', default=os.path.join(default_package_dir, 'maps', 'map.yaml'))
    nav2_param_path = LaunchConfiguration('params_file', 
                            default=os.path.join(default_package_dir, 'config', 'nav2_params.yaml'))

    return LaunchDescription([
        DeclareLaunchArgument('use_sim_time', default_value=use_sim_time,
                                             description='Use simulation (Gazebo) clock if true'),
        DeclareLaunchArgument('map', default_value=map_yaml_path,
                                             description='Full path to map file to load'),
        DeclareLaunchArgument('params_file', default_value=nav2_param_path,
                                             description='Full path to param file to load'),

        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(
                [nav2_bringup_dir, '/launch', '/bringup_launch.py']),
            launch_arguments={
                'use_sim_time': use_sim_time,
                'map': map_yaml_path,
                'params_file': nav2_param_path}.items(),
        ),

        Node(
            package='rviz2',
            executable='rviz2',
            arguments=['-d', default_rviz_path],
            parameters=[{'use_sim_time': use_sim_time}],
            output='screen'
        ),
    ])
```

初始化位姿（nav2 包中amcl需要初始位姿估计才能运行，否则无法发布tf【map -> odom】）

```python
# ros2 topic pub /initialpose geometry_msgs/msg/PoseWithCovarianceStamped "{header: {frame_id: map}}" --once
from geometry_msgs.msg import PoseStamped
from nav2_simple_commander.robot_navigator import BasicNavigator
import rclpy
def main():
    rclpy.init()
    nav = BasicNavigator()

    init_pose = PoseStamped()
    init_pose.header.frame_id = 'map'
    init_pose.header.stamp = nav.get_clock().now().to_msg()
    init_pose.pose.position.x = 0.0
    init_pose.pose.position.y = 0.0
    init_pose.pose.position.z = 0.0
    init_pose.pose.orientation.w = 1.0

    nav.setInitialPose(init_pose)
    nav.waitUntilNav2Active()
    rclpy.spin(nav)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

使用tf获取机器人实时位姿

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
        if self.buffer.can_transform("map","base_footprint",Time()):
            ts = self.buffer.lookup_transform("map","base_footprint",Time())
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

动作通信发布目标点

```python
# ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {header: {frame_id: map}, pose: {position: {x: 2.0, y: 1.0}}}}" --feedback
from geometry_msgs.msg import PoseStamped
from nav2_simple_commander.robot_navigator import BasicNavigator
import rclpy

def main():
    rclpy.init()
    nav = BasicNavigator()
    nav.waitUntilNav2Active()

    to_pose = PoseStamped()
    to_pose.header.frame_id = 'map'
    to_pose.header.stamp = nav.get_clock().now().to_msg()
    to_pose.pose.position.x = 2.0
    to_pose.pose.position.y = 1.0
    to_pose.pose.position.z = 0.0
    to_pose.pose.orientation.w = 1.0

    nav.goToPose(to_pose)
    while not nav.isTaskComplete():
        feedback = nav.getFeedback()
        nav.get_logger().info(f'distance remain: {feedback.distance_remaining}')
        # nav.cancelTask()
    result = nav.getResult()
    nav.get_logger().info(f'nav2 result: {result}')

    rclpy.spin(nav)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

动作通信发布多目标点

```python
# ...
from geometry_msgs.msg import PoseStamped
from nav2_simple_commander.robot_navigator import BasicNavigator
import rclpy

def main():
    rclpy.init()
    nav = BasicNavigator()
    nav.waitUntilNav2Active()

    to_poses = [ ]
    to_pose = PoseStamped()
    to_pose.header.frame_id = 'map'
    to_pose.header.stamp = nav.get_clock().now().to_msg()
    to_pose.pose.position.x = 2.0
    to_pose.pose.position.y = 1.0
    to_pose.pose.position.z = 0.0
    to_pose.pose.orientation.w = 1.0
    to_poses.append(to_pose)
    to_pose1 = PoseStamped()
    to_pose1.header.frame_id = 'map'
    to_pose1.header.stamp = nav.get_clock().now().to_msg()
    to_pose1.pose.position.x = 2.0
    to_pose1.pose.position.y = 1.5
    to_pose1.pose.position.z = 0.0
    to_pose1.pose.orientation.w = 1.0
    to_poses.append(to_pose1)

    nav.followWaypoints(to_poses)
    while not nav.isTaskComplete():
        feedback = nav.getFeedback()
        nav.get_logger().info(f'current waypoint: {feedback.current_waypoint}')
        # nav.cancelTask()
    result = nav.getResult()
    nav.get_logger().info(f'nav2 result: {result}')

    rclpy.spin(nav)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```



## Demo

```bash
import rclpy
from geometry_msgs.msg import PoseStamped, Pose
from nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult
from tf2_ros import TransformListener, Buffer
from tf_transformations import euler_from_quaternion, quaternion_from_euler
from rclpy.duration import Duration
# 添加服务接口
from autopatrol_interfaces.srv import SpeachText
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
import cv2

class PatrolNode(BasicNavigator):
    def __init__(self, node_name='patrol_node'):
        super().__init__(node_name)
        # 导航相关定义
        self.declare_parameter('initial_point', [0.0, 0.0, 0.0])
        self.declare_parameter('target_points', [0.0, 0.0, 0.0, 1.0, 1.0, 1.57])
        self.initial_point_ = self.get_parameter('initial_point').value
        self.target_points_ = self.get_parameter('target_points').value
        # 实时位置获取 TF 相关定义
        self.buffer_ = Buffer()
        self.listener_ = TransformListener(self.buffer_, self)
        self.speach_client_ = self.create_client(SpeachText, 'speech_text')

        # 订阅与保存图像相关定义
        self.declare_parameter('image_save_path', '')
        self.image_save_path = self.get_parameter('image_save_path').value
        self.bridge = CvBridge()
        self.latest_image = None
        self.subscription_image = self.create_subscription(
            Image, '/camera_sensor/image_raw', self.image_callback, 10)

    def image_callback(self, msg):
        """
        将最新的消息放到 latest_image 中
        """
        self.latest_image = msg

    def record_image(self):
        """
        记录图像
        """
        if self.latest_image is not None:
          pose = self.get_current_pose()
          cv_image = self.bridge.imgmsg_to_cv2(self.latest_image)
          cv2.imwrite(f'{self.image_save_path}image_{pose.translation.x:3.2f}_{pose.translation.y:3.2f}.png', cv_image)


    def speach_text(self, text):
        """
        调用服务播放语音
        """
        while not self.speach_client_.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('语合成服务未上线，等待中。。。')

        request = SpeachText.Request()
        request.text = text
        future = self.speach_client_.call_async(request)
        rclpy.spin_until_future_complete(self, future)
        if future.result() is not None:
            result = future.result().result
            if result:
                self.get_logger().info(f'语音合成成功：{text}')
            else:
                self.get_logger().warn(f'语音合成失败：{text}')
        else:
            self.get_logger().warn('语音合成服务请求失败')

    def get_pose_by_xyyaw(self, x, y, yaw):
        """
        通过 x,y,yaw 合成 PoseStamped
        """
        pose = PoseStamped()
        pose.header.frame_id = 'map'
        pose.pose.position.x = x
        pose.pose.position.y = y
        rotation_quat = quaternion_from_euler(0, 0, yaw)
        pose.pose.orientation.x = rotation_quat[0]
        pose.pose.orientation.y = rotation_quat[1]
        pose.pose.orientation.z = rotation_quat[2]
        pose.pose.orientation.w = rotation_quat[3]
        return pose

    def init_robot_pose(self):
        """
        初始化机器人位姿
        """
        # 从参数获取初始化点
        self.initial_point_ = self.get_parameter('initial_point').value
        # 合成位姿并进行初始化
        self.setInitialPose(self.get_pose_by_xyyaw(
            self.initial_point_[0], self.initial_point_[1], self.initial_point_[2]))
        # 等待直到导航激活
        self.waitUntilNav2Active()

    def get_target_points(self):
        """
        通过参数值获取目标点集合        
        """
        points = []
        self.target_points_ = self.get_parameter('target_points').value
        for index in range(int(len(self.target_points_)/3)):
            x = self.target_points_[index*3]
            y = self.target_points_[index*3+1]
            yaw = self.target_points_[index*3+2]
            points.append([x, y, yaw])
            self.get_logger().info(f'获取到目标点: {index}->({x},{y},{yaw})')
        return points

    def nav_to_pose(self, target_pose):
        """
        导航到指定位姿
        """
        self.waitUntilNav2Active()
        result = self.goToPose(target_pose)
        while not self.isTaskComplete():
            feedback = self.getFeedback()
            if feedback:
                self.get_logger().info(f'预计: {Duration.from_msg(feedback.estimated_time_remaining).nanoseconds / 1e9} s 后到达')
        # 最终结果判断
        result = self.getResult()
        if result == TaskResult.SUCCEEDED:
            self.get_logger().info('导航结果：成功')
        elif result == TaskResult.CANCELED:
            self.get_logger().warn('导航结果：被取消')
        elif result == TaskResult.FAILED:
            self.get_logger().error('导航结果：失败')
        else:
            self.get_logger().error('导航结果：返回状态无效')

    def get_current_pose(self):
        """
        通过TF获取当前位姿
        """
        while rclpy.ok():
            try:
                tf = self.buffer_.lookup_transform(
                    'map', 'base_footprint', rclpy.time.Time(seconds=0), rclpy.time.Duration(seconds=1))
                transform = tf.transform
                rotation_euler = euler_from_quaternion([
                    transform.rotation.x,
                    transform.rotation.y,
                    transform.rotation.z,
                    transform.rotation.w
                ])
                self.get_logger().info(
                    f'平移:{transform.translation},旋转四元数:{transform.rotation}:旋转欧拉角:{rotation_euler}')
                return transform
            except Exception as e:
                self.get_logger().warn(f'不能够获取坐标变换，原因: {str(e)}')
    
def main():
    rclpy.init()
    patrol = PatrolNode()
    patrol.speach_text(text='正在初始化位置')
    patrol.init_robot_pose()
    patrol.speach_text(text='位置初始化完成')

    while rclpy.ok():
        for point in patrol.get_target_points():
            x, y, yaw = point[0], point[1], point[2]
            # 导航到目标点
            target_pose = patrol.get_pose_by_xyyaw(x, y, yaw)
            patrol.speach_text(text=f'准备前往目标点{x},{y}')
            patrol.nav_to_pose(target_pose)
            patrol.speach_text(text=f"已到达目标点{x},{y},准备记录图像")
            patrol.record_image()
            patrol.speach_text(text=f"图像记录完成")
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

```python
import rclpy
from rclpy.node import Node
from autopatrol_interfaces.srv import SpeachText
import espeakng

class Speaker(Node):
    def __init__(self, node_name):
        super().__init__(node_name)
        self.speech_service = self.create_service(
            SpeachText, 'speech_text', self.speak_text_callback)
        self.speaker = espeakng.Speaker()
        self.speaker.voice = 'zh'

    def speak_text_callback(self, request, response):
        self.get_logger().info('正在朗读 %s' % request.text)
        self.speaker.say(request.text)
        self.speaker.wait()
        response.result = True
        return response

def main(args=None):
    rclpy.init(args=args)
    node = Speaker('speaker')
    rclpy.spin(node)
    rclpy.shutdown()
```




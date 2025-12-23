---
draft: false

title: "Cmake Record"
description: "CMake 配合 VsCode 及其插件构建 C++ 项目"
date: 2025-12-21
author: ["biglonglong"]

tags: ["summary", "tools", "cmake", "linux"]
summary: ""

math: false
weight: 402
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

CMake 是一个跨平台构建系统生成器，用于自动化地管理C、C++等语言的编译、链接和安装过程，项目结构一般为：

```txt
myproject/
├── CMakeLists.txt          # 项目根构建配置
├── src/					# 源文件目录
│   ├── CMakeLists.txt     
│   └── main.cpp
├── include/				# 头文件目录
│   └── mylib.h
├── lib/					# 库文件目录
│   ├── CMakeLists.txt     
│   └── mylib.cpp
├── tests/					# 测试配置
│   ├── CMakeLists.txt     
│   └── test_basic.cpp
└── build/                  # 存放构建输出的独立目录
    ├── Makefile           # 生成的文件
    ├── myapp              # 生成的可执行文件
    └── CMakeCache.txt     # 缓存配置
```

开发者通常先编写 `CMakeLists.txt`，在其中声明项目名称、可执行文件/库、依赖关系等，每次配置（`cmake`）都会生成针对当前平台的构建文件，确保跨平台编译的一致性和可移植性。然后再构建（`build`）生成目标文件，借助目标机制（`target`）管理编译单元，通过包查找（`find_package`）和依赖传播（`INTERFACE`）管理复杂依赖关系，保持项目结构清晰有序。

下面是 CMake 相关的基本工具：

- [CMake](https://cmake.org/)
- [Visual Studio Code](https://code.visualstudio.com/)，插件`Cmake`、`Cmake Tools`
- 编译器，如 [mingw-w64](https://www.mingw-w64.org/)



##  `CMakeLists.txt` 

### src + include

```cmake
# Minimum CMake version required
cmake_minimum_required(VERSION 3.15)

# Ensure IDE and IO uses UTF-8
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" OR CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    add_compile_options(-fexec-charset=UTF-8)
    add_compile_options(-finput-charset=UTF-8)
elseif(MSVC)
    add_compile_options(/execution-charset:utf-8)
    add_compile_options(/source-charset:utf-8)
endif()

# Project name
project(<projectname>)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Build type: Debug or Release
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif()
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_definitions(-DDEBUG -g3 -O0)
else()
    add_definitions(-O2)
endif()

# Include directories
include_directories(include)

# Find all source and header files
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.h" "include/*.hpp")

# Set the output directory for the executable
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)

# Add the executable
add_executable(<exename> ${SOURCES} ${HEADERS})
```

### src + include + main

```cmake
# Minimum CMake version required
cmake_minimum_required(VERSION 3.15)

# Ensure IDE and IO uses UTF-8
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" OR CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    add_compile_options(-fexec-charset=UTF-8)
    add_compile_options(-finput-charset=UTF-8)
elseif(MSVC)
    add_compile_options(/execution-charset:utf-8)
    add_compile_options(/source-charset:utf-8)
endif()

# Project name
project(<projectname>)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Build type: Debug or Release
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif()
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_definitions(-DDEBUG -g3 -O0)
else()
    add_definitions(-O2)
endif()

# Set the output directory
# CMAKE_LIBRARY_OUTPUT_DIRECTORY for Linux shared library
# CMAKE_RUNTIME_OUTPUT_DIRECTORY for Windows DLL
# CMAKE_ARCHIVE_OUTPUT_DIRECTORY for static library
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/bin)

# Generate shared library
aux_source_directory(${PROJECT_SOURCE_DIR}/src SRC_LISTS)
add_library(<libname>
SHARED
${SRC_LISTS}
)
target_include_directories(<libname>
PUBLIC
${PROJECT_SOURCE_DIR}/include
)

# Generate executable
add_executable(<exename> main.cpp)
target_include_directories(<exename>
PUBLIC
${PROJECT_SOURCE_DIR}/include
)

# Link library to executable
target_link_libraries(<exename>
PUBLIC
<libname>
)
```

### all in src

```cmake
# Minimum CMake version required
cmake_minimum_required(VERSION 3.15)

# Ensure IDE and IO uses UTF-8
if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" OR CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
    add_compile_options(-fexec-charset=UTF-8)
    add_compile_options(-finput-charset=UTF-8)
elseif(MSVC)
    add_compile_options(/execution-charset:utf-8)
    add_compile_options(/source-charset:utf-8)
endif()

# Project name
project(<projectname>
    VERSION 1.0
    DESCRIPTION "<demo for CMakeLists.txt>"
    PROJECT_HOMEPAGE_URL "<https://example.com>"
    LANGUAGES CXX
)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Build type: Debug or Release
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif()
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_definitions(-DDEBUG -g3 -O0)
else()
    add_definitions(-O2)
endif()

# Set the output directory
# CMAKE_LIBRARY_OUTPUT_DIRECTORY for Linux shared library
# CMAKE_RUNTIME_OUTPUT_DIRECTORY for Windows DLL
# CMAKE_ARCHIVE_OUTPUT_DIRECTORY for static library
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/bin)
set(Sub_FUNC1_DIR ${PROJECT_SOURCE_DIR}/src/<subfuncdir1>)
set(Sub_FUNC2_DIR ${PROJECT_SOURCE_DIR}/src/<subfuncdir2>)

# recurison to subdirectories
add_subdirectory(src)



##########################################
##      SRC CMakeLists.txt example      ##
##########################################
# Project name
project(<srcprojectname>)

# recurison to subdirectories
add_subdirectory(<subfuncdir1>)
add_subdirectory(<subfuncdir2>)

# Generate executable
add_executable(${PROJECT_NAME} main.cpp)
target_include_directories(${PROJECT_NAME}
PUBLIC
${Sub_FUNC1_DIR}
)

# Link library to executable
target_link_libraries(${PROJECT_NAME}
PUBLIC
<lib1name>
)



##########################################
##   subfuncdir1 CMakeLists.txt example ##
##########################################
# Project name
project(<subfuncdir1projectname>)

# Generate shared library
aux_source_directory(${CMAKE_SOURCE_DIR} SRC_LISTS)
add_library(<lib1name>
SHARED
${SRC_LISTS}
)
target_include_directories(<lib1name>
PUBLIC
${Sub_FUNC2_DIR}
)

# Link shared library to library
target_link_libraries(${PROJECT_NAME}
PUBLIC
<lib2name>
)

# find_package(OpenCV REQUIRED)
# if(TARGET OpenCV::core)
#     message(STATUS "OpenCV found: ${OpenCV_VERSION}")
# endif()

# Link extern static library to library
target_link_libraries(${PROJECT_NAME}
PUBLIC
<staticlibname>
)


##########################################
##   subfuncdir2 CMakeLists.txt example ##
##########################################
# Project name
project(<subfuncdir2projectname>)

# Generate shared library
aux_source_directory(${PROJECT_SOURCE_DIR}/src SRC_LISTS)
add_library(<lib2name>
SHARED
${SRC_LISTS}
)
```



## 在 VSCode 中

VSCode 会自动识别项目中的 `CMakeLists.txt` 文件，并提示你安装 CMake 和编译工具

### 1. 配置 CMake 构建

1. 选择编译器工具链：按 `Ctrl+Shift+P`，搜索 `CMake: Select a Kit`，从自动检测的编译器列表中选择一个
2. 配置项目：再次按 `Ctrl+Shift+P`，搜索 `CMake: Configure`，例如 Unix Makefiles（默认）或 Ninja。

> 等价于：`mkdir build; cd build; cmake .. [-DCMAKE_BUILD_TYPE=Debug -G "MinGW Makefiles"]` 

配置完成后， `build/` 目录下生成`Makefile`，此时已经配置好了当前环境依赖。

### 2. 构建项目

按 `Ctrl+Shift+P`，搜索 `CMake: Build`运行，或者点击 VSCode 状态栏中的 Build 按钮（最好先清理 `build\` 和 `bin\` 目录）

> 等价于：`cd build; cmake --build .`（最好先清空 `build\` 和 `bin\` 目录）

构建完成后， `build/` 目录下生成`*.exe`，这里主要是对代码进行编译，一般修改代码后重复此操作。

### 3. 调试项目

打开调试面板，创建一个 `launch.json` 文件，选择 C++ (GDB/LLDB) 配置，补充调试信息：

```json
{
  "version": "0.2.0",          			// launch.json 的版本号
  "configurations": [          			// 可以配置多个调试配置
    {
      "name": "Debug MyProject",  		// 配置名称（在调试下拉列表中显示）
      "type": "cppdbg",          		// 调试器类型：C++ Debugger
      "request": "launch",       		// 启动方式：launch（启动程序）或 attach（附加到进程）
      "program": "${workspaceFolder}/build/MyProject",  // ！要调试的可执行文件路径
      "args": [],               		// 程序启动参数
      "stopAtEntry": false,     		// 是否在程序入口处暂停
      "cwd": "${workspaceFolder}",  	// 程序工作目录
      "environment": [],        		// 环境变量
      "externalConsole": false, 		// 是否使用外部终端
      "MIMode": "gdb",         			// 调试器接口：gdb 或 lldb
      "miDebuggerPath": "/usr/bin/gdb",  // ！调试器路径
      "preLaunchTask": "build",  		// 调试前执行的任务（tasks.json 中的任务名）
      "setupCommands": [        		// 调试器初始化命令
        {
          "description": "Enable pretty-printing for gdb",
          "text": "-enable-pretty-printing",  // 启用 gdb 漂亮打印
          "ignoreFailures": true
        }
      ]
    }
  ]
}
```

对应的`tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "cmake --build build",  // 构建命令
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": ["$gcc"]
    }
  ]
}
```

配置完成后，点击调试按钮来开始调试。

> C++ `system`命令调试器无法跟踪，慎用！

### 4. CMake Presets

CMake Presets（预设）是 CMake 3.19 引入的功能，旨在简化 CMake 项目的配置和构建流程，让开发者无需记忆和输入冗长的命令行参数。它通过 JSON 文件定义预设，实现跨平台、团队共享的构建配置。例如：

- **Configure Presets**（配置预设）

```json
{
  "version": 4,
  "configurePresets": [
    {
      "name": "linux-debug",
      "displayName": "Linux Debug",
      "description": "Debug build for Linux",
      "generator": "Unix Makefiles",
      "binaryDir": "${sourceDir}/build/${presetName}",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug",
        "CMAKE_CXX_FLAGS": "-Wall -Wextra"
      },
      "environment": {
        "CC": "gcc",
        "CXX": "g++"
      }
    }
  ]
}
```

- **Build Presets**（构建预设）

```json
{
  "buildPresets": [
    {
      "name": "build-debug",
      "configurePreset": "linux-debug",
      "jobs": 4,
      "targets": ["all"],
      "configuration": "Debug"
    }
  ]
}
```

- **Test Presets**（测试预设）

```json
{
  "testPresets": [
    {
      "name": "test-debug",
      "configurePreset": "linux-debug",
      "configuration": "Debug",
      "output": {"outputOnFailure": true}
    }
  ]
}
```

- **Package Presets**（打包预设）
---
draft: false

title: "Agent Development"
description: "智能体开发，langchain 和 langgraph"
date: 2025-01-05
author: ["biglonglong"]

tags: ["summary", "ai", "agent", "langchain", "langgraph"]
summary: ""

math: false
weight: 305
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



## LangChain

构建在 LangGraph 运行时之上，Agent系统（模型+提示词+工具+中间件+记忆），LangSmith 用于可观测性

- [LangChain 1.0 Agents 文档](https://docs.langchain.com/oss/python/langchain/agents)
- [LangChain API 参考](https://reference.langchain.com/python/langchain/agents)

### 多模型切换

```python
from dotenv import load_dotenv

load_dotenv()

def get_default_model():
    if os.getenv("OPENAI_API_KEY"):
        return "gpt-4-turbo"
    elif os.getenv("GOOGLE_API_KEY"):
        return "google:gemini-1.5-flash"
    elif os.getenv("ANTHROPIC_API_KEY"):
        return "anthropic:claude-sonnet-4-5"
    elif os.getenv("GROQ_API_KEY"):
        return "groq:llama-3.3-70b-versatile"
    else:
        raise ValueError("No API key found!")
```

### 基本使用

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

# messages = [
#     {"role": "system", "content": "you are a helpful assistant."},
#     {"role": "user", "content": "Hello! How are you?"},
# ]
messages = [
    SystemMessage(content="you are a helpful assistant."),
    HumanMessage(content="Hello! How are you?"),
]
# print("messages:", messages)
print(messages[-1].type, ": ", messages[-1].content)

# sync
try:
    response = model.invoke(messages, config=None)  # can be string as well
    messages.append(response)
    print(messages[-1].type, ": ", messages[-1].content)
except ValueError as e:
    print("configuration error:", e)
except ConnectionError as e:
    print("network error:", e)
except Exception as e:
    print("unknown error:", type(e).__name__, ":", e)

# streaming
# for chunk in model.stream(messages):
#     print(chunk.content, end="", flush=True)
```

### 普通调用返回

`finish_reason`、`model_name`、`token_usage`

```json
{
    "content": "\nHello! 😊 I'm doing great, thanks for asking! How are you doing today? I'm here to help with anything you need!",
    "additional_kwargs": {
        "refusal": null
    },
    "response_metadata": {
        "token_usage": {
            "completion_tokens": 197,
            "prompt_tokens": 15,
            "total_tokens": 212,
            "completion_tokens_details": {
                "accepted_prediction_tokens": null,
                "audio_tokens": null,
                "reasoning_tokens": 167,
                "rejected_prediction_tokens": null
            },
            "prompt_tokens_details": null
        },
        "model_provider": "openai",
        "model_name": "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
        "system_fingerprint": "",
        "id": "019b53c7558eafd3ce017b75c61a3841",
        "finish_reason": "stop",
        "logprobs": null
    },
    "type": "ai",
    "name": null,
    "id": "lc_run--019b53c7-53ef-7172-a335-aa785cad47ba-0",
    "tool_calls": [],
    "invalid_tool_calls": [],
    "usage_metadata": {
        "input_tokens": 15,
        "output_tokens": 197,
        "total_tokens": 212,
        "input_token_details": {},
        "output_token_details": {
            "reasoning": 167
        }
    }
}
```

### 多模态

```python
import os
import base64
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage


def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
    return encoded_string


def get_mime_type(image_path: str) -> str:
    ext = os.path.splitext(image_path)[1].lower()
    if ext in [".jpg", ".jpeg"]:
        return "image/jpeg"
    elif ext == ".png":
        return "image/png"
    elif ext == ".gif":
        return "image/gif"
    elif ext == ".webp":
        return "image/webp"
    else:
        return "application/octet-stream"


load_dotenv()

# support multimodal input
model = init_chat_model(
    model_provider="openai",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    model="qwen-vl-max",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

img_path = "./test.png"
messages = [
    SystemMessage(content="you are a helpful assistant."),
    HumanMessage(
        content=[
            {"type": "text", "text": "describe the following image simply."},
            # {
            #     "type": "image_url",
            #     "image_url": {"url": "https://example.com/path/to/your/image.jpg"},
            # },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:{get_mime_type(img_path)};base64,{encode_image_to_base64(img_path)}"
                },
            },
            # ...
        ]
    ),
]

response = model.invoke(messages, config=None)
messages.append(response)
print(messages[-1].type, ": ", messages[-1].content)
```

### 提示词模板

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.prompts import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
)

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

# prompt
template = PromptTemplate.from_template(
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
prompt_demo1 = template.format(input_language="English", output_language="Chinese")
prompt_demo2 = template.invoke(
    {"input_language": "English", "output_language": "Chinese"}
)
# messages = prompt_demo2.to_messages()
print("Template string: ", template.template)
print("Template variables: ", template.input_variables)
print("Template format: ", prompt_demo1)
print("Template format: ", prompt_demo2.text)


# messages
# chat_template = ChatPromptTemplate.from_messages(
#     [
#         (
#             "system",
#             "You are a helpful assistant that translates {input_language} to {output_language}.",
#         ),
#         ("user", "Translate the following text: {text}"),
#     ]
# )
system_message = SystemMessagePromptTemplate.from_template(
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human_message = HumanMessagePromptTemplate.from_template(
    "Translate the following text: {text}"
)
chat_template = ChatPromptTemplate.from_messages(
    [
        system_message,
        human_message,
    ]
)
# chat_template = ChatPromptTemplate.from_messages([system_message + human_message])

# partical_chat_template = chat_template.partial(
#     input_language="English", output_language="Chinese"
# )
# messages = partical_chat_template.format_messages(
#     text="How are you today?",
# )
messages = chat_template.format_messages(
    input_language="English",
    output_language="Chinese",
    text="How are you today?",
)
for msg in messages:
    print(f"{msg.type}: {msg.content}")

response = model.invoke(messages, config=None)
messages.append(response)
print(messages[-1].type, ": ", messages[-1].content)
```

### 模板库

```python
from langchain_core.prompts import ChatPromptTemplate


class PromptLibrary:

    TRANSLATOR = ChatPromptTemplate.from_template(
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("user", "Translate the following text: {text}"),
    )

    SUMMARIZER = ChatPromptTemplate.from_template(
        ("system", "You are a concise summarization assistant."),
        ("user", "Summarize the following text: {text}"),
    )

    QA = ChatPromptTemplate.from_template(
        (
            "system",
            "You are an expert in answering questions based on provided context.",
        ),
        (
            "user",
            "Based on the following context, answer the question: {context}\nQuestion: {question}",
        ),
    )

    SENTIMENT_ANALYZER = ChatPromptTemplate.from_template(
        ("system", "You are a sentiment analysis assistant."),
        ("user", "Analyze the sentiment of the following text: {text}"),
    )

    CODE_EXPLAINER = ChatPromptTemplate.from_template(
        ("system", "You are an expert programmer who explains code clearly."),
        ("user", "Explain the following code: {code_snippet}"),
    )


messages = PromptLibrary.TRANSLATOR.format_messages(
    input_language="English",
    output_language="French",
    text="Hello, how are you?",
)
```

### LCEL 链式调用

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.prompts import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
)

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate.from_template(
            "You are a helpful assistant that translates {input_language} to {output_language}."
        ),
        HumanMessagePromptTemplate.from_template(
            "Translate the following text: {text}"
        ),
    ]
)

chain = chat_template | model
response = chain.invoke(
    {
        "input_language": "English",
        "output_language": "Chinese",
        "text": "Hello, how are you?",
    }
)
print(response.content)

```

### 多轮对话（轮次裁剪）

滑动窗口自动裁剪（保留系统消息 + 最近消息）

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.prompts import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
)

load_dotenv()


def clip_recent_messages(messages, max_pairs=5):
    if len(messages) <= max_pairs * 2 + 1:
        return messages

    system_msgs = [msg for msg in messages if msg.type == "system"]
    conversation_msgs = [msg for msg in messages if msg.type != "system"]

    recent_conversation_msgs = conversation_msgs[-(max_pairs * 2) :]

    return system_msgs + recent_conversation_msgs


model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

system_message = SystemMessagePromptTemplate.from_template(
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
human_message = HumanMessagePromptTemplate.from_template(
    "Translate the following text: {text}"
)
messages = system_message.format_messages(
    input_language="English",
    output_language="Chinese",
)

while True:
    input_text = input("Enter text to translate (or 'exit' to quit): ")
    if input_text.lower() == "exit":
        break

    messages = clip_recent_messages(messages, max_pairs=2)
    user_msg = human_message.format_messages(
        text=input_text,
    )
    messages.append(user_msg[0])

    response = model.invoke(messages, config=None)
    messages.append(response)
    print(messages[-1].type, ": ", messages[-1].content)
```

### 工具

#### 工具调用返回

```python
Response: {
    "messages": [
        HumanMessage(
            content="What time is it now? Don't tell me the seconds.",
        ),
        AIMessage(
            tool_calls=[
                {
                    "name": "get_current_time",
                    "args": {"without_seconds": True},
                    "id": "cnnv06vs4",
                    "type": "tool_call",
                }
            ],
        ),
        ToolMessage(
            content="2025-12-25 19:11",
            name="get_current_time",
            id="5b6931f8-de26-4c07-9ab5-16503fd9840e",
            tool_call_id="cnnv06vs4",
        ),
        AIMessage(
            content="The current time is 19:11.",
        ),
    ]
}
```

#### 工具调用

```python
# 简单场景，CPU 密集型任务
import os
import time
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from pydantic import BaseModel, Field, field_validator
from langchain_core.tools import StructuredTool

load_dotenv()


# Define args schema
class GetCurrentTimeArgs(BaseModel):
    """
    获取当前的日期和时间的参数
    """

    without_seconds: bool = Field(
        default=False,
        description="是否不显示秒数，默认为 False",
    )


# 1. Define a tool to get the current time
@tool
def get_current_time(without_seconds: bool = False) -> str:
    """
    获取当前的日期和时间

    参数：
        without_seconds: 是否不显示秒数，默认为 False

    返回:
        当前的日期和时间字符串
    """
    from datetime import datetime

    try:
        if without_seconds:
            return datetime.now().strftime("%Y-%m-%d %H:%M")
        else:
            return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return f"get_current_time error: {str(e)}"


# 2 Define a tool to get the current time[args validation]
@tool(args_schema=GetCurrentTimeArgs)
def get_current_time_args_validation(without_seconds: bool = False) -> str:
    """
    获取当前的日期和时间

    返回:
        当前的日期和时间字符串
    """
    from datetime import datetime

    try:
        if without_seconds:
            return datetime.now().strftime("%Y-%m-%d %H:%M")
        else:
            return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return f"get_current_time error: {str(e)}"


# 3 Define a tool to get the current time[StructuredTool]
def get_current_time_structured(without_seconds: bool = False) -> str:
    from datetime import datetime

    try:
        if without_seconds:
            return datetime.now().strftime("%Y-%m-%d %H:%M")
        else:
            return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return f"get_current_time error: {str(e)}"


get_current_time_tool = StructuredTool.from_function(
    func=get_current_time_structured,
    name="get_current_time_structured",
    description="\n获取当前的日期和时间\n\n返回:\n        当前的日期和时间字符串\n",
    args_schema=GetCurrentTimeArgs,
)

# Test invoke
res = get_current_time.invoke({"without_seconds": True})
print("<get_current_time> invoke result:", res)
print("<get_current_time> name:", get_current_time.name)
print("<get_current_time> description:", get_current_time.description)
print("<get_current_time> args:", get_current_time.args)
exit(0)

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
model_with_time = model.bind_tools([get_current_time])

response = model_with_time.invoke("What time is it now? Don't tell me the seconds.")
print(response.type, ": ")
if hasattr(response, "tool_calls"):
    for call in response.tool_calls:
        print(call["name"], ":", call["args"])
else:
    print(response.content)

# tool_calls=[
#     {
#         name: get_current_time,
#         args: {
#             without_seconds: True
#         },
#         id: 2e6hyt315,
#         type: tool_call
#     }
# ]


# tools factory
def create_category_search(category: str) -> StructuredTool:
    class SearchArgs(BaseModel):
        query: str = Field(..., description="搜索关键词")

        @field_validator("query")
        def validate_query(cls, v):
            if not v or len(v.strip()) == 0:
                raise ValueError("查询关键词不能为空")
            return v

    @tool
    def search_products(query: str) -> dict:
        sample_data = {
            "电子产品": [
                {"name": "iPhone 14", "price": 7999},
                {"name": "Samsung Galaxy S22", "price": 6999},
                {"name": "Sony WH-1000XM4", "price": 2499},
            ],
            "服装": [
                {"name": "Levi's 牛仔裤", "price": 499},
                {"name": "Nike 运动鞋", "price": 699},
                {"name": "Adidas 运动衫", "price": 399},
            ],
        }

        results = [
            item
            for item in sample_data.get(category, [])
            if query.lower() in item["name"].lower()
        ]

        return {"category": category, "results": results}

    return StructuredTool.from_function(
        func=search_products,
        name=f"search_{category.lower()}",
        description=f"\n搜索类别为 '{category}' 的商品\n\n参数:\n    query: 搜索关键词\n\n返回:\n    包含搜索结果的字典\n",
        args_schema=SearchArgs,
    )

```

#### 异步工具调用

```python
# IO 密集型（API 调用、数据库、文件操作）
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
import asyncio
import aiohttp
from langchain_core.tools import tool

load_dotenv()


@tool
async def async_fetch_url(url: str) -> str:
    """
    异步获取指定URL的内容

    参数：
        url: 目标URL

    返回:
        URL的内容字符串
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()


model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

model_with_fetch = model.bind_tools([async_fetch_url])


# Test invoke
async def test_invoke():
    res = await async_fetch_url.ainvoke({"url": "https://chat.deepseek.com/"})
    print("<async_fetch_url> invoke result:", res[:10], "...")
    print("<async_fetch_url> name:", async_fetch_url.name)
    print("<async_fetch_url> description:", async_fetch_url.description)
    print("<async_fetch_url> args:", async_fetch_url.args)


async def main():
    await test_invoke()

    response = await model_with_fetch.ainvoke(
        "give me content from url: https://chat.deepseek.com/."
    )
    print(response.type, ": ")
    if hasattr(response, "tool_calls"):
        for call in response.tool_calls:
            print(call["name"], ":", call["args"])
    else:
        print(response.content)


if __name__ == "__main__":
    asyncio.run(main())
```

### 基本 Agent

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_core.tools import tool

load_dotenv()


@tool
def get_current_time(without_seconds: bool = False) -> str:
    """
    获取当前的日期和时间

    参数：
        without_seconds: 是否不显示秒数，默认为 False

    返回:
        当前的日期和时间字符串
    """
    # importance of docstring for tool description
    from datetime import datetime

    try:
        if without_seconds:
            return datetime.now().strftime("%Y-%m-%d %H:%M")
        else:
            return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return f"get_current_time error: {str(e)}"


model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

agent = create_agent(
    model=model,
    tools=[get_current_time],  # only provide the necessary tools
    system_prompt="You are an assistant who answers concisely and clearly.",
)

messages = [
    {
        "role": "user",
        "content": "What time is it now? Don't tell me the seconds.",
    }
]
response = agent.invoke(
    {"messages": messages}
)  # give messages of this epoch conversation
for msg in response["messages"]:
    print(msg.type, ": ")
    if hasattr(msg, "content") and msg.content:
        print(msg.content)
    elif hasattr(msg, "tool_calls") and msg.tool_calls:
        for call in msg.tool_calls:
            print(call["name"], ":", call["args"])
    elif hasattr(msg, "name"):
        print(msg["name"], ":", msg["content"])
    else:
        pass

print("\n--- Next Question ---\n")

messages = response["messages"] + [
    {
        "role": "user",
        "content": "next question: what is the time in New York?",
    }
]
response2 = agent.invoke({"messages": messages})
for msg in response2["messages"]:
    print(msg.type, ": ")
    if hasattr(msg, "content") and msg.content:
        print(msg.content)
    elif hasattr(msg, "tool_calls") and msg.tool_calls:
        for call in msg.tool_calls:
            print(call["name"], ":", call["args"])
    elif hasattr(msg, "name"):
        print(msg["name"], ":", msg["content"])
    else:
        pass
```

### 回调监控

```python
import os
import time
from dotenv import load_dotenv
from langchain.messages import HumanMessage, ToolMessage
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_core.callbacks import BaseCallbackHandler
from typing import Any, Dict

load_dotenv()


@tool
def get_time():
    """获取时间"""
    from datetime import datetime

    return f"{datetime.now().strftime('%H:%M')}"


@tool
def add(a: int, b: int):
    """加法计算"""
    return f"{a} + {b} = {a + b}"


class ToolMonitor(BaseCallbackHandler):
    def __init__(self):
        self._start_time = None
        self.tool_stats = {}

    def on_tool_start(self, serialized: Dict[str, Any], input_str: str, **kwargs):
        self._start_time = time.time()

        tool_name = serialized.get("name", "unknown_tool")
        print(f"{tool_name}调用: {input_str[:30]}...")

        if tool_name not in self.tool_stats:
            self.tool_stats[tool_name] = {
                "success_calls": 0,
                "error_calls": 0,
                "avg_duration": 0.0,
            }

    def on_tool_end(self, output: ToolMessage, **kwargs):
        cur_duration = time.time() - self._start_time
        tool_name = kwargs.get("name", "unknown_tool")
        prev_avg_duration = self.tool_stats[tool_name]["avg_duration"]
        print(f"{tool_name}耗时: {cur_duration:.2f} 秒完成:{output.content[:30]}...")

        self.tool_stats[tool_name]["success_calls"] += 1
        self.tool_stats[tool_name]["avg_duration"] = (
            cur_duration + prev_avg_duration
        ) / 2.0

    def on_tool_error(self, error: Exception, **kwargs):
        tool_name = kwargs.get("name", "unknown_tool")
        print(f"{tool_name}调用出错: {error}")

        self.tool_stats[tool_name]["error_calls"] += 1

    def get_stats(self):
        for tool_name, stats in self.tool_stats.items():
            print(
                f"工具: {tool_name} | 成功调用: {stats['success_calls']} | 错误调用: {stats['error_calls']} | 平均耗时: {stats['avg_duration']:.2f} 秒"
            )

    def on_chain_end(self, outputs, *, run_id, parent_run_id=None, **kwargs):
        # print(outputs)
        pass


model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
agent = create_agent(
    model=model,
    tools=[get_time, add],
    system_prompt="你是一个有用的助手，可以使用工具来帮助用户。",
)
monitor = ToolMonitor()

questions = ["现在几点？", "计算 5+3"]
for q in questions:
    print(f"问题: {q}")
    response = agent.invoke(
        {"messages": [HumanMessage(content=q)]}, config={"callbacks": [monitor]}
    )
    print(f"回答: {response['messages'][-1].content}")
    print("-" * 20)

print("\n工具调用统计:")
monitor.get_stats()
```

### 流失传输

| 模式       | 描述                                                         |
| :--------- | :----------------------------------------------------------- |
| `values`   | 在图的每一步之后，流式传输状态的完整值。                     |
| `updates`  | 在图的每个步骤后流式传输状态更新。如果同一步骤中发生多次更新（例如，运行多个节点），则这些更新会单独流式传输。 |
| `custom`   | 从图节点内部流式传输自定义数据。                             |
| `messages` | 在任何调用 LLM 的图节点中，流式传输二元组（LLM 令牌，元数据）。 |
| `debug`    | 在图执行的整个过程中流式传输尽可能多的信息。                 |

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain.agents import create_agent

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

agent = create_agent(
    model=model,
    system_prompt="You are an assistant who answers concisely and clearly.",
)

# streaming
for chunk in agent.stream(
    {"messages": [HumanMessage(content="Hello! How are you?")]}, stream_mode="messages"
):
    # print(chunk["model"]["messages"][-1].content)  # stream_mode="updates"

    if chunk[0].content is not None:
        print(chunk[0].content, end="", flush=True)  # stream_mode="messages"
```

### 进程内存记忆（会话管理）

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)

agent = create_agent(
    model=model,
    system_prompt="You are an assistant who answers concisely and clearly.",
    checkpointer=InMemorySaver(),
)
# {"thread_id": "xxx", "messages": [HumanMessage("..."), AIMessage("..."), ...]}


contents = [
    "Hello! I am John.",
    "Can you tell me my name?",
]
config = {"configurable": {"thread_id": "conversation_1"}}
# config2 = {"configurable": {"thread_id": "conversation_2"}}  # different context

for content in contents:
    response = agent.invoke(
        {"messages": [HumanMessage(content=content)]}, config=config
    )  # history in response
    print(response["messages"][-2].type, ": ", response["messages"][-2].content)
    print(response["messages"][-1].type, ": ", response["messages"][-1].content)

```

### 持久化记忆

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain.agents import create_agent
from langgraph.checkpoint.sqlite import SqliteSaver

"""
1. invoke 前：LangGraph 自动调用 checkpointer.get(thread_id="user_123")      
    - 查询数据库，读取该 thread_id 的历史消息
    - 如果是第一次，返回空列表
2. invoke 中：Agent 处理时会看到完整历史(默认确实会全部读取，)
    state = {
        "messages": [历史消息1, 历史消息2, 新消息]  # 自动合并
    }
3. invoke 后：LangGraph 自动调用 checkpointer.put(thread_id, state)
    - 将新的完整状态写入数据库
    - 数据库存储：(thread_id, timestamp, messages)
"""

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
db_path = "./db/checkpoints.sqlite"

with SqliteSaver.from_conn_string(db_path) as checkpointer:  # auto manage connect
    agent = create_agent(
        model=model,
        system_prompt="You are an assistant who answers concisely and clearly.",
        checkpointer=checkpointer,
    )
    config = {"configurable": {"thread_id": "conversation_1"}}

    contents = [
        "Hello! I am John Steve Take Z.",
        "Can you tell me my name?",
    ]
    for content in contents:
        response = agent.invoke(
            {"messages": [HumanMessage(content=content)]}, config=config
        )
        print(response["messages"][-2].type, ": ", response["messages"][-2].content)
        print(response["messages"][-1].type, ": ", response["messages"][-1].content)


# clean on time, or backup, or archive
# import sqlite3

# conn = sqlite3.connect(db_path)
# cursor = conn.cursor()
# cursor.execute("DELETE FROM checkpoints WHERE thread_id = ?", ("conversation_1",))
# conn.commit()
# conn.close()
```

### 手动裁剪

```python
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.messages import trim_messages

messages = [
    HumanMessage(content="message 1"),
    AIMessage(content="response 1"),
    HumanMessage(content="message 2"),
    AIMessage(content="response 2"),
    HumanMessage(content="message 3"),
    AIMessage(content="response 3"),
]
print("Original messages length:", len(messages))

trimmed = trim_messages(
    messages,
    max_tokens=4,
    token_counter=len,
    strategy="last",
)
print("Trimmed messages length:", len(trimmed))
for msg in trimmed:
    print(f"{msg.type}: {msg.content}")
```

### 自定义中间件

```bash
用户输入 (HumanMessage)
            |
            v
+---------------------------------------+
|          agent.invoke(input)          |
+---------------------------------------+
            |
            | 1. 获取当前状态 (State)
            v
    [  Checkpointer (内存/数据库) ] <--- 加载历史消息
            |
            v
+---------------------------------------+
|  Middleware: before_model (按顺序执行)   | <--- 修改 state
+---------------------------------------+
            |
            | 2. 准备好的 Messages 发送给 LLM
            v
+---------------------------------------+
|           LLM (大语言模型)             |
|  (接收处理后的消息，生成 AIMessage)      |
+---------------------------------------+
            |
            | 3. 得到模型回复
            v
+---------------------------------------+
|  Middleware: after_model (逆序执行)    | <--- state 已包含 AI 回复
+---------------------------------------+
            |
            | 4. 状态归约 (State Reducer)
            v
+---------------------------------------+
|    messages.add(new_messages)         | <--- 默认是“追加”而非“覆盖”
+---------------------------------------+
            |
            | 5. 保存状态到 Checkpointer
            v
+---------------------------------------+
|          返回最终 Response             |
+---------------------------------------+
```

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain.agents import create_agent
from langchain.agents.middleware import AgentState, AgentMiddleware, hook_config
from langgraph.runtime import Runtime
from langchain_core.messages import RemoveMessage
from langgraph.checkpoint.memory import InMemorySaver
from typing_extensions import NotRequired
from typing import Any

"""
what can do before model?
- logging
- formatting
- trimming
- validation

what can return after model? [append mode]
- None: no changes
- dict: update state
- {"jump_to": "step_name"}: jump to specific step
    - "end": Jump to the end of the agent execution (or the first after_agent hook)
    - "tools":  Jump to the tools node
    - "model": Jump to the model node (or the first before_model hook)
"""


class CounterMiddleware(AgentMiddleware):
    # maintain state in middleware instance
    def __init__(self, max_calls: int = 5):
        super().__init__()
        self.count = 0
        self.max_calls = max_calls

    def after_model(self, state, runtime) -> None | dict[str, Any]:
        self.count += 1
        print("> Model call count in after_model(middleware inner):", self.count)
        if self.count >= self.max_calls:
            raise ValueError("Exceeded maximum model call counts.")
        return None


class CustomState(AgentState):
    model_call_count: NotRequired[int]
    user_id: NotRequired[str]


class CallsLimitMiddleware(AgentMiddleware[CustomState]):
    # maintain state in CustomState
    def __init__(self, max_calls: int = 5):
        super().__init__()
        self.max_calls = max_calls

    @hook_config(can_jump_to=["end"])
    def before_model(
        self, state: CustomState, runtime: Runtime
    ) -> None | dict[str, Any]:
        count = state.get("model_call_count", 0)
        if count >= self.max_calls:
            return {
                "messages": [AIMessage(content="Model call limit reached.")],
                "jump_to": "end",
            }
        return {"model_call_count": count}

    def after_model(
        self, state: CustomState, runtime: Runtime
    ) -> None | dict[str, Any]:
        count = state["model_call_count"] + 1
        print("> Model call count in after_model(custom state):", count)
        return {"model_call_count": count}


class MessagesTrimMiddleware(AgentMiddleware):
    # must without checkpointer, and manual combine messages(response & new input)
    def __init__(self, max_messages: int = 20) -> None:
        super().__init__()
        self.max_messages = max_messages

    def before_model(self, state, runtime) -> None | dict[str, Any]:
        messages = state["messages"]
        if len(messages) > self.max_messages:
            trimmed_messages = messages[-self.max_messages :]
            print(f"> Trimming messages from {len(messages)} to {self.max_messages}.")
            return {"messages": trimmed_messages}
        return None


class MessagesLimitMiddleware(AgentMiddleware):
    # with checkpointer, use RemoveMessage to remove old messages in checkpointer
    def __init__(self, max_messages: int = 20) -> None:
        super().__init__()
        self.max_messages = max_messages

    def before_model(self, state, runtime) -> None | dict[str, Any]:
        messages = state["messages"]
        if len(messages) > self.max_messages:
            to_remove = [
                RemoveMessage(id=m.id)
                for m in messages[: (len(messages) - self.max_messages)]
            ]
            if to_remove:
                print(f"> Trimming {len(to_remove)} messages from the beginning.")
                return {"messages": to_remove}

        return None


class LoggingMiddleware(AgentMiddleware):
    def after_model(self, state, runtime) -> None | dict[str, Any]:
        messages = state["messages"]
        print("----------------------------")
        for msg in messages:
            print(msg.type, ": ", msg.content)
        print("----------------------------")

        return None


load_dotenv()
model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
agent = create_agent(
    model=model,
    middleware=[
        CallsLimitMiddleware(max_calls=2),
        MessagesLimitMiddleware(max_messages=1),
        LoggingMiddleware(),
    ],  # before_model in order, and after_model in reverse
    checkpointer=InMemorySaver(),
    state_schema=CustomState,
    system_prompt="You are an assistant who answers concisely and clearly.",
)
config = {"configurable": {"thread_id": "conversation_1"}}

contents = [
    "Hello! I am John Steve.",
    "Can you tell me my name?",
    "what's the first question I asked you?",
]
for content in contents:
    response = agent.invoke(
        {"messages": [HumanMessage(content=content)]},
        config=config,
    )
    if "Model call limit reached" in response["messages"][-1].content:
        print(">>> Stopped due to model call limit.")
        break
```

#### 自动摘要

触发摘要信息后，`[摘要, 最近消息]`投喂给模型

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents.middleware import SummarizationMiddleware

load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
agent = create_agent(
    model=model,
    system_prompt="You are an assistant who answers concisely and clearly.",
    middleware=[
        SummarizationMiddleware(
            model=model,  # auto summarize
            trigger=("messages", 6),
            keep=("messages", 2),
            trim_tokens_to_summarize=200,
            # summary_prompt=
        )
    ],
    checkpointer=InMemorySaver(),
)
config = {"configurable": {"thread_id": "conversation_1"}}


contents = [
    "Hello! I am John Steve Take Z.",
    "Can you tell me my name?",
    "Can you summarize our conversation so far?",
    "What is my name?",
]
for content in contents:
    response = agent.invoke(
        {"messages": [HumanMessage(content=content)]}, config=config
    )
    print([msg.pretty_print() for msg in response["messages"]])
```

#### 人工审核

在AI代理执行工具调用（如API操作、数据修改等）之前暂停，等待人类进行审批、编辑或拒绝操作，然后再继续执行。

```python
from langchain.agents.middleware import HumanInTheLoopMiddleware

agent = create_agent(
    model=model,
    tools=[send_email],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={"send_email": True}
        )
    ]
)
```

#### 敏感信息处理

自动识别对话中的敏感个人信息，并按照可配置的策略进行处理，以保护隐私和满足合规要求。

```python
from langchain.agents.middleware import PIIMiddleware

agent = create_agent(
    model=model,
    middleware=[
        PIIMiddleware("email", strategy="redact"),   
        PIIMiddleware("phone_number", strategy="block")
    ]
)
```

### 结构化输出

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from pydantic import BaseModel, Field, field_validator, ValidationError
from typing import Optional, List
from enum import Enum


# Pydantic Model → JSON Schema as input prompt and output validation
class Priority(str, Enum):
    """person priority levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Person(BaseModel):
    """
    A person with a name age and occupation.
    """

    name: str = Field(description="The person's name", min_length=2, max_length=20)
    age: int = Field(description="The person's age", ge=0, le=150)
    occupation: str = Field(description="The person's occupation")
    email: Optional[str] = Field(
        None, description="The person's email address, optional"
    )
    priority: Priority = Field(
        description="The person's priority level: low/medium/high",
        pattern="Priority\.(?:LOW|MEDIUM|HIGH)",
    )
    company_id: int = 321

    @field_validator("email")
    @classmethod
    def validate_email(cls, v, info):
        "custom email validator"
        # info.data include others
        if v is not None and "@" not in v:
            raise ValueError("Invalid email address")
        return v


class PersonList(BaseModel):
    """
    A list of persons.
    """

    persons: List[Person] = Field(description="A list of person objects")


# try:
#     p_invalid = Person(
#         name="Li Si",
#         age=28,
#         occupation="Product Manager",
#         email="lisiatexample.com",  # Invalid email
#         priority=Priority.HIGH,
#         company_id=123,
#     )
# except ValidationError as e:
#     print("Validation Error:", e)
#     exit(1)


load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
structured_model = model.with_structured_output(PersonList)

prompt = """
Zhang San is a 30-year-old software engineer, medium level priority.
Wu Guang is a 25-year-old data scientist, low level priority, his email is wu.guang@qq.com.
Li Si is a 28-year-old product manager, high level priority.
"""
try:
    response = structured_model.invoke(
        [
            SystemMessage(content="Get Person List from the following text."),
            HumanMessage(content=prompt.strip()),
        ]
    )
    print("return type:", type(response))
    for i, p in enumerate(response.persons):
        print(f"Person {i+1}:")
        print("  name:", p.name)
        print("  age:", p.age)
        print("  occupation:", p.occupation)
        print("  email:", p.email)
        print("  priority:", p.priority)
except ValidationError as e:
    print("Validation Error:", e)

```

### 错误处理

多利用`try` `except`保证代码的稳定性和可维护性

- 重试机制 - 包装器
- 回退机制 - 循环调用
- 输出验证 - `ValidationError`、`re`

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage


load_dotenv()

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
fallback_model = init_chat_model(
    model_provider="openai",
    base_url="https://api.siliconflow.cn/v1/",
    model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
retry_model_with_fallback = model.with_retry(  # error for next try
    retry_if_exception_type=(ConnectionError, TimeoutError),
    wait_exponential_jitter=True,  # backoff and jitter
    stop_after_attempt=3,
).with_fallbacks(  # error for fallback
    fallbacks=[fallback_model],
    fallback_condition=(Exception,),
)

question = "Hello, what's your name?"
response = retry_model_with_fallback.invoke([HumanMessage(content=question)])
print(response.type, ": ", response.content)
```

### 检索增强生成

> 生成链(rag_chain)：文档加载器 (document_loader)、 文本处理器 (text_processor)、向量存储 (vector_store)、检索器 (retriever)、生成器 (generator)
>
> - **分块策略**: 根据文档类型选择合适的分块大小
> - **检索优化**: 使用 MMR 增加结果多样性
> - **提示工程**: 设计清晰的提示模板
> - 来源引用和置信度评估

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_community.document_loaders import TextLoader, JSONLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings


def cosine_sim(v1, v2):
    import numpy as np

    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


"""
Source File Path
"""
test_file = "./data/raw.json"


"""
Load Source File
- DirectoryLoader
- TextLoader、UnstructuredMarkdownLoader、JSONLoader、CSVLoader、Docx2txtLoader、PyPDFLoader、WebBaseLoader、BSHTMLLoader、CSVLoader
"""
# import json
# with open(test_file, "r", encoding="utf-8") as f:
#     data = json.load(f)
# documents = []
# for item in data:
#     documents.append(
#         Document(
#             page_content=json.dumps(item, ensure_ascii=False, indent=2),
#             metadata={
#                 "source": test_file,
#                 "type": "json_item",
#                 "encoding": "utf-8",
#             },
#         )
#     )

loader = JSONLoader(file_path=test_file, jq_schema=".[ ]?", text_content=False)
documents = loader.load()
print("documents Count: ", len(documents))  #
# print("documents[0] Metadata", documents[0].metadata)
# print("documents[0] Length", len(documents[0].page_content))
# print("documents[0] Content", documents[0].page_content)  # all as string


"""
Split Document into Chunks
- RecursiveCharacterTextSplitter for article splitting
- jq_schema=".[ ]?" for json array splitting
"""
# splitter = RecursiveCharacterTextSplitter(
#     chunk_size=200, chunk_overlap=20, separators=["\n\n", "\n", "。", " ", ""]
# )
# chunks = splitter.split_documents(documents)
chunks = documents
print("chunks Count: ", len(chunks))
# for i, chunk in enumerate(chunks[:2]):
#     print(f"--- Chunk {i} --- {len(chunk.page_content)}")
#     print(chunk.page_content)

"""
Sentences Vector Embedding
"""
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
query = "give me a catalyst design with Ir-RuO2"
query_vector = embeddings.embed_query(query)
print(f"Vector Dimension: {len(query_vector)}")

KnowledgeBase = [chunk.page_content for chunk in chunks]
kb_vectors = embeddings.embed_documents(KnowledgeBase)
greatest_sim_id = -1
greatest_sim_value = -1
for i, kb_vector in enumerate(kb_vectors):
    sim_value = cosine_sim(query_vector, kb_vector)
    # print(f"Similarity {i}: {sim_value}")
    if sim_value > greatest_sim_value:
        greatest_sim_value = sim_value
        greatest_sim_id = i
print(f"Greatest Similarity: {greatest_sim_value} at ID {greatest_sim_id}")
print("Most Similar Content: ", KnowledgeBase[greatest_sim_id])

```

#### 服务器PINCONE

```python
import os
import time
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langchain.agents import create_agent
from langchain_community.document_loaders import JSONLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

test_file = "./data/raw.json"
loader = JSONLoader(file_path=test_file, jq_schema=".[ ]?", text_content=False)
documents = loader.load()
chunks = documents

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"), environment="us-east1-gcp")
index_name = "langchain-rag-demo"
dimension = 384
# pc.delete_index(name=index_name)
existing_indexes = [idx.name for idx in pc.list_indexes()]
if index_name in existing_indexes:
    print("index exists")
    index = pc.Index(index_name)
else:
    print("create new index")
    pc.create_index(
        name=index_name,
        dimension=dimension,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    time.sleep(10)
    index = pc.Index(index_name)
stat = index.describe_index_stats()
print("vectors dimension:", stat.get("dimension", "N/A"))
print("vectors count:", stat.get("total_vector_count", 0))

# embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
# vectorstore = PineconeVectorStore.from_documents(
#     documents=chunks, embedding=embeddings, index_name=index_name
# )
# print("chunks indexed")


@tool
def search_knowledge_base(query: str) -> str:
    """
    search the knowledge base about catalyst design for relevant information

    Args:
        query (str): The search query.
    """
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    index_name = "langchain-rag-demo"
    vectorstore = PineconeVectorStore(
        pinecone_api_key=os.getenv("PINECONE_API_KEY"),
        index_name=index_name,
        embedding=embeddings,
    )
    docs = vectorstore.similarity_search(query, k=2)
    print(f"rag search {len(docs)} results")
    return "\n\n".join([doc.page_content for doc in docs])


model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
agent = create_agent(
    model=model,
    tools=[search_knowledge_base],
    system_prompt="You are an assistant that can access the knowledge base about catalyst design. Use the search_knowledge_base tool to search for relevant information and then answer the question.",
)

question = "tell me the reagents of a catalyst design with Ir-RuO2."
response = agent.invoke({"messages": [{"role": "user", "content": question}]})
for msg in response["messages"]:
    print(msg.type, ":", msg.content)
```

#### 本地Chroma

```python
import os
import time
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langchain.agents import create_agent
from langchain_community.document_loaders import JSONLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

test_file = "./data/raw.json"
loader = JSONLoader(file_path=test_file, jq_schema=".[ ]?", text_content=False)
documents = loader.load()
chunks = documents

db_dir = "./db"

# embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
# vectorstore = Chroma.from_documents(
#     documents=chunks, embedding=embeddings, persist_directory=db_dir
# )
# print("chunks indexed")


@tool
def search_knowledge_base(query: str) -> str:
    """
    search the knowledge base about catalyst design for relevant information

    Args:
        query (str): The search query.
    """
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = Chroma(embedding_function=embeddings, persist_directory=db_dir)
    vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    docs = vector_retriever.invoke(query)
    print(f"rag search {len(docs)} results")
    return "\n\n".join([doc.page_content for doc in docs])


model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)
agent = create_agent(
    model=model,
    tools=[search_knowledge_base],
    system_prompt="You are an assistant that can access the knowledge base about catalyst design. Use the search_knowledge_base tool to search for relevant information and then answer the question.",
)

question = "tell me the reagents of a catalyst design with Ir-RuO2."
response = agent.invoke({"messages": [{"role": "user", "content": question}]})
for msg in response["messages"]:
    print(msg.type, ":", msg.content)
```

#### 混合检索器

| 查询类型 | 查询示例               | 向量搜索 | BM25 | 混合检索 |
| -------- | ---------------------- | -------- | ---- | -------- |
| 语义查询 | "LangChain 的主要功能" | ⭐⭐⭐      | ⭐    | ⭐⭐⭐      |
| 精确匹配 | "langchain>=1.0.0"     | ⭐        | ⭐⭐⭐  | ⭐⭐⭐      |
| 专有名词 | "BM25 算法"            | ⭐⭐       | ⭐⭐⭐  | ⭐⭐⭐      |
| 概念查询 | "如何优化性能"         | ⭐⭐⭐      | ⭐    | ⭐⭐⭐      |
| 代码查询 | "@tool def search"     | ⭐        | ⭐⭐⭐  | ⭐⭐⭐      |

```python
import os
import time
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langchain.agents import create_agent
from langchain_community.document_loaders import JSONLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma  # Semantic Search
from langchain_community.retrievers import BM25Retriever  # Keyword Search
from langchain_classic.retrievers import (
    EnsembleRetriever,
)  #  RRF (Reciprocal Rank Fusion): w1 / (k + rank_bm25) + w2 / (k + rank_vector)

test_file = "./data/raw.json"
loader = JSONLoader(file_path=test_file, jq_schema=".[ ]?", text_content=False)
documents = loader.load()
chunks = documents

db_dir = "./db"

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma(embedding_function=embeddings, persist_directory=db_dir)
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

bm25_retriever = BM25Retriever.from_documents(chunks)
bm25_retriever.k = 2

ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever], weights=[0.25, 0.75]
)

query = "tell me the reagents of a catalyst design with Ir-RuO2."
docs_Vec = vector_retriever.invoke(query)
print("Vector Retriever Results:")
print(docs_Vec[0].page_content[:100])

docs_BM25 = bm25_retriever.invoke(query)
print("BM25 Retriever Results:")
print(docs_BM25[0].page_content[:100])

docs_Ensemble = ensemble_retriever.invoke(query)
print("Ensemble Retriever Results:")
print(docs_Ensemble[0].page_content[:100])
```

#### 大量文档处理

1. 分层检索

   - 先用 BM25 快速过滤到 top-100
   - 再用向量搜索精选 top-3

2. 预过滤

   - 用元数据过滤（日期、分类）
   - 在子集上做混合检索

3. 缓存热门查询

   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   def cached_search(query):
       return ensemble_retriever.invoke(query)
   ```

#### 生产实践

```python
import os
import time
from pathlib import Path
from typing import TypedDict
from dotenv import load_dotenv

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
from functools import lru_cache

from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, START, END

import logging

log_file = f"logs/rag.log"
Path(log_file).parent.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler(log_file, encoding="utf-8"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


class RAGState(TypedDict):
    query: str
    rewritten_query: str
    context_docs: list[Document]
    context_metadata: list[dict]
    context: str
    answer: str
    confidence: str


class HybridRAGSystem:
    def __init__(
        self,
        model,
        embbedder,
        dimension,
        splitter,
        db_dir="./db/",
        init_vs_docs=[],
        retriever_args={"bm25_k": 5, "vector_k": 5, "weights": [0.5, 0.5]},
    ):
        self.splitter = splitter

        self.embbedder = embbedder
        self.dimension = dimension

        should_create_db = (
            not Path(db_dir).exists() or not list(Path(db_dir).iterdir())
        ) and init_vs_docs != []
        if should_create_db:
            Path(db_dir).mkdir(parents=True, exist_ok=True)
            self.vectorstore = Chroma.from_documents(
                documents=init_vs_docs,
                embedding_function=self.embbedder,
                persist_directory=db_dir,
            )
        else:
            self.vectorstore = Chroma(
                embedding_function=self.embbedder,
                persist_directory=db_dir,
            )
        self.retriever = self._create_ensemble_retriever(**retriever_args)

        self.model = model
        self.query_rewrite_agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt="you are an expert in query rewriting. Rewrite user queries to be standalone.",
        )
        self.rag_agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt="you are an expert in retrieval augmented generation. Use the retrieved documents to answer user questions.",
        )
        self.eval_agent = create_agent(
            model=self.model,
            tools=[],
            system_prompt="you are an expert in answer evaluation. Evaluate the confidence of answers based on provided context, only return a number between 0 and 1.",
        )
        self.graph = self._build_rag_graph()

    def trans2chunks(self, inputs: list, type_name: str) -> list[Document]:
        """***"""
        doucuments = []

        for input in inputs:
            if type_name == "str":
                doucuments.append(
                    Document(
                        page_content=input,
                        metadata={
                            "type_name": type_name,
                            "create_time": time.strftime("%Y%m%d_%H%M%S"),
                        },
                    )
                )

            else:
                logger.warning(f"Unsupported input:{type_name} - {input}")

        return self.splitter.split_documents(doucuments)

    def update_vectorstore(self, chunks: list[Document]):
        """***"""
        self.vectorstore.add_documents(chunks)
        self.vectorstore.persist()

    def retrieve_with_scores(self, query: str, k: int = 3) -> list[Document]:
        return self.vectorstore.similarity_search_with_score(query, k=k)

    def _create_ensemble_retriever(self, bm25_k, vector_k, weights):
        # BM25 retriever
        chroma_data = self.vectorstore.get()
        docs = [
            Document(page_content=content, metadata=meta or {})
            for content, meta in zip(chroma_data["documents"], chroma_data["metadatas"])
        ]
        self.bm25_retriever = BM25Retriever.from_documents(docs)
        self.bm25_retriever.k = bm25_k
        # vector retriever
        vector_retriever = self.vectorstore.as_retriever(search_kwargs={"k": vector_k})

        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.bm25_retriever, vector_retriever], weights=weights
        )

    @lru_cache(maxsize=100)
    def retrieve(self, query: str, k: int = 3) -> list[Document]:
        retrieve_docs = self.ensemble_retriever.invoke(query)
        return retrieve_docs

    def rag(self, question: str) -> dict:
        result = self.graph.invoke({"query": question})
        return result

    def _build_rag_graph(self):
        graph = StateGraph(RAGState)

        graph.add_node("rewrite_query", self.rewrite_query)
        graph.add_node("retrieve_documents", self.retrieve_documents)
        graph.add_node("generate_answer", self.generate_answer)
        graph.add_node("evaluate_answer", self.evaluate_answer)

        graph.add_edge(START, "rewrite_query")
        graph.add_edge("rewrite_query", "retrieve_documents")
        graph.add_edge("retrieve_documents", "generate_answer")
        graph.add_edge("generate_answer", "evaluate_answer")
        graph.add_edge("evaluate_answer", END)

        return graph.compile()

    def rewrite_query(self, state: RAGState) -> RAGState:
        query = state["query"]
        response = self.query_rewrite_agent.invoke(
            {"messages": [HumanMessage(content=f"Rewrite the query: {query}")]}
        )
        rewritten_query = response["messages"][-1].content.strip()
        return {"rewritten_query": rewritten_query}

    def retrieve_documents(self, state: RAGState) -> RAGState:
        rewritten_query = state["rewritten_query"]
        docs = self.retrieve(rewritten_query)

        context_docs = []
        context_metadata = []
        context = ""
        for doc in docs:
            context_docs.append(doc)
            context_metadata.append(doc.metadata)
            context += doc.page_content + "\n\n"
        return {
            "context_docs": context_docs,
            "context_metadata": context_metadata,
            "context": context,
        }

    def generate_answer(self, state: RAGState) -> RAGState:
        rewritten_query = state["rewritten_query"]
        context = state["context"]
        response = self.rag_agent.invoke(
            {
                "messages": [
                    HumanMessage(
                        content=f"Based on the following context, answer the question: {rewritten_query}\n\nContext:\n{context}"
                    )
                ]
            }
        )
        answer = response["messages"][-1].content.strip()
        return {"answer": answer}

    def evaluate_answer(self, state: RAGState) -> RAGState:
        rewritten_query = state["rewritten_query"]
        context = state["context"]
        answer = state["answer"]
        response = self.eval_agent.invoke(
            {
                "messages": [
                    HumanMessage(
                        content=f"Evaluate the confidence of the following answer based on the question and context. Return a number between 0 and 1.\n\nQuestion: {rewritten_query}\n\nContext:\n{context}\n\nAnswer:\n{answer}"
                    )
                ]
            }
        )
        confidence_str = response["messages"][-1].content.strip()
        return {"confidence": confidence_str}

    def embed_query(self, query) -> list[float]:
        embedding = self.embbedder.embed_query(query)
        return embedding

    def embed_documents(self, documents) -> list[list[float]]:
        doc_contents = [doc.page_content for doc in documents]
        embeddings = self.embbedder.embed_documents(doc_contents)
        return embeddings


SAMPLE_DOCUMENTS = [
    "langchain is a framework for building applications with large language models (LLMs). It provides tools and abstractions to simplify the development of LLM-powered applications.",
    "RAG (Retrieval-Augmented Generation) systems combine retrieval of relevant documents with generation of answers using LLMs. The typical workflow involves query rewriting, document retrieval, answer generation, and answer evaluation.",
    "Common vector databases include Pinecone, Weaviate, Chroma, and FAISS. Each has its own strengths and use cases.",
    "Normal RAG system workflow:\n1. Query Rewriting: Reformulate user queries for better retrieval.\n2. Document Retrieval: Fetch relevant documents from a vector database.\n3. Answer Generation: Use LLMs to generate answers based on retrieved documents.\n4. Answer Evaluation: Assess the quality and confidence of the generated answers.",
    "Common vector databases:\n- Chroma: Lightweight, suitable for development and prototyping\n- Pinecone: Cloud-native, fully managed\n- Milvus: Open-source, high performance\n- Weaviate: Supports hybrid search\n- FAISS: Developed by Facebook, suitable for research\n\nSelection suggestions:\n- Development phase: Use Chroma or in-memory vector storage\n- Production environment: Choose Pinecone or Milvus based on scale\n- Need hybrid search: Consider Weaviate\n\nPerformance optimization:\n- Choose appropriate index types\n- Adjust search parameters\n- Use batch operations",
    "Free resources for learning LangChain and RAG systems:\n- LangChain Documentation: https://langchain.com/docs/\n- LangChain GitHub Repository: https://github.com/langchain-ai/langchain\n- RAG System Tutorials: https://www.example.com/rag-tutorials\n- YouTube Channels: Search for LangChain and RAG system tutorials on YouTube\n- Online Courses: Platforms like Coursera, Udemy, and edX may offer courses on LLMs and RAG systems",
    "HuggingFace Embeddings provides pre-trained models for generating text embeddings. These embeddings can be used in various applications, including RAG systems, to represent text data in a vector space for similarity search and retrieval tasks.",
    "Chroma is an open-source vector database designed for efficient storage and retrieval of high-dimensional vectors. It is lightweight and easy to set up, making it suitable for development and prototyping of applications that require vector search capabilities.",
    "BM25Retriever is a retrieval model based on the Okapi BM25 algorithm. It ranks documents based on their relevance to a given query by considering term frequency, inverse document frequency, and document length. BM25 is widely used in information retrieval systems for its effectiveness in ranking search results.",
    "EnsembleRetriever combines multiple retrieval methods to improve the quality of search results. By leveraging the strengths of different retrievers, such as vector-based and traditional keyword-based methods, EnsembleRetriever can provide more comprehensive and relevant results for user queries.",
    "Common vector databases:\n- Chroma: Lightweight, suitable for development and prototyping\n- Pinecone: Cloud-native, fully managed\n- Milvus: Open-source, high performance\n- Weaviate: Supports hybrid search\n- FAISS: Developed by Facebook, suitable for research\n\nSelection suggestions:\n- Development phase: Use Chroma or in-memory vector storage\n- Production environment: Choose Pinecone or Milvus based on scale\n- Need hybrid search: Consider Weaviate\n\nPerformance optimization:\n- Choose appropriate index types\n- Adjust search parameters\n- Use batch operations",
]

if __name__ == "__main__":
    load_dotenv()

    model = init_chat_model(
        model_provider="openai",
        base_url="https://api.groq.com/openai/v1",
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.7,
        max_tokens=100,
    )

    embbedder = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    diminsion = 384

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=100,
        chunk_overlap=50,
        separators=["\n\n", "\n", "。", "！", "？", ".", "!", "?", " ", ""],
    )

    retriever_args = {"bm25_k": 3, "vector_k": 3, "weights": [0.5, 0.5]}

    rag_system = HybridRAGSystem(
        model,
        embbedder,
        diminsion,
        splitter,
        retriever_args=retriever_args,
    )
    # rag_system.update_vectorstore(
    #     rag_system.trans2chunks(SAMPLE_DOCUMENTS, type_name="str")
    # )

    while True:
        question = input("Input your question (or 'exit' to quit): ")
        if question.lower() == "exit" or question.lower() == "quit":
            break

        result = rag_system.rag(question)
        print("=" * 60)
        print("🚀 RAG System Answer Report:")
        print(f"❓ Question: {question}")
        print(f"📝 Rewritten Query: {result['rewritten_query']}")
        print(f"📄 Retrieved documents: ")
        for idx, doc in enumerate(result["context_docs"]):
            print(f"   - [{idx}] {doc.page_content[:100]}...")
        print(f"💡 Answer: {result['answer']}")
        print(f"📊 Confidence: {result['confidence']}")
        print("=" * 60)

```



## LangGraph

 创建带节点和边的状态机/复杂控制流，包括节点（ LLM 调用、工具执行）、边（执行顺序）、状态（节点之间传递的数据）

- [LangGraph overview - Docs by LangChain](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangSmith](https://smith.langchain.com/)

### 基本使用

```python
import os
import random
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver


class State(TypedDict):
    messages: Annotated[list, add_messages]  # auto add messages
    current_step: str


class SelfGraph:
    def __init__(self):
        load_dotenv()
        self.model = init_chat_model(
            model_provider="openai",
            base_url="https://api.groq.com/openai/v1",
            model="llama-3.3-70b-versatile",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7,
            max_tokens=100,
        )

    def build_graph(self) -> StateGraph:
        # GRAPH CREATION
        graph = StateGraph(State)

        # nodes insert
        graph.add_node("node1", self.node1)
        graph.add_node("node2", self.node2)
        graph.add_node("node3", self.node3)

        # edges insert
        graph.add_edge(START, "node1")
        graph.add_edge("node1", "node2")
        graph.add_conditional_edges(
            "node2",
            self.is_continue,
            {"node3": "node3", END: END},
        )
        graph.add_edge("node3", "node2")

        # memory insert
        memory = MemorySaver()  # save the state of each graph invoke

        return graph.compile(checkpointer=memory)

    # ROUNTE DEFINITION, decide which node to go next
    def is_continue(self, state: State) -> Literal["node3", END]:
        user_input = input("is to call node3(chat-bot)? \nN/n to end: ")
        if user_input.lower() == "n":
            return END
        else:
            return "node3"

    # NODE DEFINITION, get a state and return a processd state by this node
    def node1(self, state: State) -> State:
        state["messages"] = "Node 1 executed." # no in memory
        state["current_step"] = "node1"
        return state

    def node2(self, state: State) -> State:
        return {"messages": "Node 2 executed.", "current_step": "node2"}

    def node3(self, state: State) -> State:
        response = self.model.invoke(state["messages"])
        return {
            "messages": "Node 3 chat to output: " + response.content.replace("\n", ""),
            "current_step": "node3",
        }


if __name__ == "__main__":
    app = SelfGraph().build_graph()

    config = {"configurable": {"thread_id": "session_001"}}
    result = app.invoke(
        {
            "messages": [HumanMessage(content="Hello, start the graph workflow.")],
            "current_step": "start",
        },
        config=config,
    )

    print("messages history:")
    state = app.get_state(config)
    for msg in state.values["messages"]:
        print(f"  - {msg.type}: {msg.content}")
    print("last state:", state.values["current_step"])
```

### Multi-Agents 架构

> 单个 Agent 在处理复杂任务时可能存在以下问题：
>
> - **上下文过载**：单个 Agent 需要处理所有类型的任务
> - **专业性不足**：难以在所有领域都表现出色
> - **维护困难**：单一庞大的 Agent 难以调试和优化
>
> 多 Agent 架构通过**分而治之**的策略解决这些问题：
>
> - **反馈链路长**：
> - **依赖路由决策**：死循环

```text
监督者模式（Supervisor Pattern）
                    ┌──────────────┐
                    │  Supervisor  │
                    │   (任务分配)    │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Agent A    │ │  Agent B    │ │  Agent C    │
    │  (研究员)    │ │  (编辑)      │ │  (审核员)    │
    └─────────────┘ └─────────────┘ └─────────────┘
协作模式（Collaborative Pattern）
    ┌─────────────┐     ┌─────────────┐
    │  Agent A    │────▶│  Agent B    │
    │  (写初稿)    │     │  (审核修改)  │
    └─────────────┘     └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  Agent C    │
                        │  (最终确认)  │
                        └─────────────┘
层级模式（Hierarchical Pattern）
                    ┌──────────────┐
                    │   Manager    │
                    └──────┬───────┘
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │  Team Lead A│                 │  Team Lead B│
    └──────┬──────┘                 └──────┬──────┘
      ┌────┴────┐                     ┌────┴────┐
      ▼         ▼                     ▼         ▼
   Agent 1   Agent 2              Agent 3   Agent 4
```

### 基本 Multi-Agents

```python
import os
import uuid
import operator
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END


@tool
def search_information(query: str) -> str:
    """
    Search for information on the web.

    Args:
        query (str): The search query.

    Returns:
        str: The search results.
    """
    print(f"!!!!🔍 Searching the web for: {query}")
    # Simulate a web search with dummy data
    dummy_data = {
        "Python programming": "Python is a high-level, interpreted programming language.",
        "LangGraph": "LangGraph is a framework for building graph-based applications.",
        "AI agents": "AI agents are autonomous entities that can perform tasks using artificial intelligence.",
        "default": "This is a important technology field that is rapidly evolving.",
    }
    for key in dummy_data:
        if key.lower() in query.lower():
            return dummy_data[key]
    return dummy_data["default"]


class SharedState(TypedDict):
    messages: Annotated[
        list[HumanMessage | AIMessage | SystemMessage],
        add_messages,
    ]
    involved_agents: Annotated[list[str], operator.add]
    total_tokens: Annotated[int, operator.add]
    final_result: str


class SelfGraph:
    def __init__(self):
        load_dotenv()

        model = init_chat_model(
            model_provider="openai",
            base_url="https://api.groq.com/openai/v1",
            model="llama-3.1-8b-instant",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7,
            max_tokens=100,
        )

        self.stages = ["researcher", "writer", "editor", "translator", "final"]
        self.researcher = create_agent(
            model=model,
            tools=[search_information],
            system_prompt="you are a helpful research assistant, specialized in finding information by searching the web.",
        )
        self.writer = create_agent(
            model=model,
            tools=[],
            system_prompt="you are a creative writer, specialized in writing engaging content.",
        )
        self.editor = create_agent(
            model=model,
            tools=[],
            system_prompt="you are a meticulous editor, specialized in refining and polishing content.",
        )
        self.translator = create_agent(
            model=model,
            tools=[],
            system_prompt="you are a skilled translator, specialized in translating text accurately.",
        )
        self.supervisor = create_agent(
            model=model,
            tools=[],
            system_prompt=f"you are a project supervisor, specialized in choosing the next agent based on task progress: {self.stages}.",
        )

    def build_graph(self) -> StateGraph:
        # GRAPH CREATION
        graph = StateGraph(SharedState)

        # nodes insert
        graph.add_node("supervisor", self.supervise)
        graph.add_node("researcher", self.research)
        graph.add_node("writer", self.write)
        graph.add_node("editor", self.edit)
        graph.add_node("translator", self.translate)
        graph.add_node("final", self.finalize)

        # edges insert
        graph.add_edge(START, "supervisor")
        graph.add_conditional_edges(
            "supervisor",
            self.route,
            {
                "researcher": "researcher",
                "writer": "writer",
                "editor": "editor",
                "translator": "translator",
                "final": "final",
            },
        )
        graph.add_edge("researcher", "supervisor")
        graph.add_edge("writer", "supervisor")
        graph.add_edge("editor", "supervisor")
        graph.add_edge("translator", "supervisor")
        graph.add_edge("final", END)

        # memory insert
        memory = MemorySaver()

        return graph.compile(checkpointer=memory)

    # ROUNTER
    def route(
        self, state: SharedState
    ) -> Literal["researcher", "writer", "editor", "translator", "final"]:
        return state["involved_agents"][-1]

    # NODES
    def supervise(
        self, state: SharedState
    ) -> Literal["researcher", "writer", "editor", "translator", "final"]:
        next_agent = None
        token_usage = 0
        last_msg_content = state["messages"][-1].content if state["messages"] else ""
        last_role = state["involved_agents"][-1] if state["involved_agents"] else "none"

        if last_msg_content == "" or last_role == "none":
            next_agent = "researcher"

        elif state["total_tokens"] > 3000:
            next_agent = "final"

        elif state["involved_agents"].count(last_role) >= 2:
            current_idx = self.stages.index(last_role)
            next_agent = (
                self.stages[current_idx + 1]
                if current_idx + 1 < len(self.stages)
                else "final"
            )

        else:
            response = self.supervisor.invoke(
                {
                    "messages": HumanMessage(
                        (
                            f"the last message is: {last_msg_content}. "
                            f"the last involved agent is: {last_role}. "
                            "based on the last message and last involved agent, choose the next agent."
                        )
                    ),
                }
            )
            token_usage += response["messages"][-1].usage_metadata.get(
                "total_tokens", 0
            )
            selectd_role_line = response["messages"][-1].content.strip().lower()
            if "translator" in selectd_role_line:
                next_agent = "translator"
            elif "editor" in selectd_role_line:
                next_agent = "editor"
            elif "writer" in selectd_role_line:
                next_agent = "writer"
            elif "researcher" in selectd_role_line:
                next_agent = "researcher"
            else:
                next_agent = "final"

        human_in_the_loop = interrupt(
            {
                "instruction": "Select next Agent",
                "options": [
                    "researcher",
                    "writer",
                    "editor",
                    "translator",
                    "final",
                    "n",
                ],
                "last_message_abstract": f"{last_msg_content[:64]}...",
                "expected_next_agent": next_agent,
            }
        )

        decision = human_in_the_loop.strip().lower()
        if decision == "n":
            next_agent = "final"
        elif decision in [
            "researcher",
            "writer",
            "editor",
            "translator",
            "final",
        ]:
            next_agent = decision
        else:
            print("Invalid input, proceeding with Expected Next Agent.")

        return {"involved_agents": [next_agent], "total_tokens": token_usage}

        # from langgraph.types import Send

        # def supervisor(state: State):
        #     """将任务分发给多个 Agent"""
        #     return [
        #         Send("agent_a", {"task": "子任务1"}),
        #         Send("agent_b", {"task": "子任务2"})
        #     ]

    def research(self, state: SharedState) -> SharedState:
        last_msg_content = state["messages"][-1].content
        research_result = self.researcher.invoke(
            {
                "messages": [
                    HumanMessage(
                        "Based on the following request, conduct research and provide relevant information:\n"
                        + last_msg_content
                    )
                ],
            }
        )
        return {
            "messages": [
                AIMessage(
                    content=f"researcher: {research_result['messages'][-1].content}"
                )
            ],
            "total_tokens": research_result["messages"][-1].usage_metadata.get(
                "total_tokens", 0
            ),
        }

    def write(self, state: SharedState) -> SharedState:
        last_msg_content = state["messages"][-1].content
        draft = self.writer.invoke(
            {
                "messages": [
                    HumanMessage(
                        "Based on the following research information, write a detailed draft:\n"
                        + last_msg_content
                    )
                ],
            }
        )
        return {
            "messages": [AIMessage(content=f"writer: {draft['messages'][-1].content}")],
            "total_tokens": draft["messages"][-1].usage_metadata.get("total_tokens", 0),
        }

    def edit(self, state: SharedState) -> SharedState:
        last_msg_content = state["messages"][-1].content
        edit_result = self.editor.invoke(
            {
                "messages": [
                    HumanMessage(
                        "Based on the following draft, edit and refine the content:\n"
                        + last_msg_content
                    )
                ],
            }
        )
        return {
            "messages": [
                AIMessage(content=f"editor: {edit_result['messages'][-1].content}")
            ],
            "total_tokens": edit_result["messages"][-1].usage_metadata.get(
                "total_tokens", 0
            ),
        }

    def translate(self, state: SharedState) -> SharedState:
        last_msg_content = state["messages"][-1].content
        translation = self.translator.invoke(
            {
                "messages": [
                    HumanMessage(
                        "Translate the following content into Chinese:\n"
                        + last_msg_content
                    )
                ],
            }
        )
        return {
            "messages": [
                AIMessage(content=f"translator: {translation['messages'][-1].content}")
            ],
            "total_tokens": translation["messages"][-1].usage_metadata.get(
                "total_tokens", 0
            ),
        }

    def finalize(self, state: SharedState) -> SharedState:
        last_msg_content = state["messages"][-1].content
        return {"final_result": last_msg_content}


if __name__ == "__main__":
    app = SelfGraph().build_graph()
    thread_id = str(uuid.uuid4())
    config = {"recursion_limit": 30, "configurable": {"thread_id": thread_id}}

    question = "Hello, give me a detailed report on Python programming."
    result = app.invoke(
        {
            "messages": [HumanMessage(content=f"user: {question}")],
            "involved_agents": [],
            "total_tokens": 0,
            "final_result": "",
        },
        config=config,
    )

    while "__interrupt__" in result:
        print("-" * 64)
        print(result["__interrupt__"])
        your_input = input("> Your Select: ").strip().lower()
        result = app.invoke(
            Command(resume=your_input),
            config=config,
        )

    print("#" * 64)
    print("🛑 Result Report:")
    print("#" * 64)
    for k, v in result.items():
        if k == "involved_agents":
            print(f"🤖 Involved Agents: {', '.join(v)}")

        elif k == "final_result":
            print("📝 Final Result:", v)

        elif k == "messages":
            print("💬 Conversation Messages:")
            for msg in v:
                print(" - ", msg.content[:100], "...")

        elif k == "total_tokens":
            print(f"💰 Total Tokens Used): {v}")

        else:
            pass
```

### Send 并行

```python
import operator
from typing import TypedDict, Annotated, Literal
from langgraph.types import Send
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    sections: list[str]
    results: Annotated[list[str], operator.add]


def planner(state: State):
    return {"sections": ["section1", "section2", "section3"]}


def writer(state: dict):
    section = state["section"]
    content = f"Write {section} content"
    return {"results": [content]}


def route_to_workers(state: State):
    return [Send("writer", {"section": s}) for s in state["sections"]]


if __name__ == "__main__":
    graph = StateGraph(State)
    graph.add_node("planner", planner)
    graph.add_node("writer", writer)
    graph.add_edge(START, "planner")
    graph.add_conditional_edges("planner", route_to_workers, ["writer"])
    graph.add_edge("writer", END)

    app = graph.compile()
    result = app.invoke({})
    print(result)
```



## LangSmith

 LangChain 官方提供的可观测性平台，自动追踪和监控

- [LangSmith](https://smith.langchain.com/)

| 功能       | 描述                    |
| ---------- | ----------------------- |
| Traces     | 记录完整的执行链路      |
| Runs       | 单次 LLM 调用的详细记录 |
| Feedback   | 用户反馈收集            |
| Datasets   | 测试数据集管理          |
| Evaluation | 自动化评估              |

`.env` 配置

```bash
LANGSMITH_API_KEY=your_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=your_project
```

Code 配置

```python
import os
langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_PROJECT"] = "your_project"
```

DEMO 示例

```python
import os
import time
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from functools import wraps


load_dotenv()
# LangSmith setup
langsmith_api_key = os.environ.get("LANGSMITH_API_KEY")
if langsmith_api_key:
    os.environ["LANGSMITH_TRACING"] = "true"
    os.environ["LANGSMITH_PROJECT"] = "test"

model = init_chat_model(
    model_provider="openai",
    base_url="https://api.groq.com/openai/v1",
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
    max_tokens=100,
)


def custom_traceable(name: str, tags: list[str] | None = None):

    def decorator(func):

        @wraps(func)
        def wrapper(*args, **kwargs):
            func_name = name or func.__name__
            func_tags = tags or []

            start_time = time.time()
            try:
                res = func(*args, **kwargs)
                print(f"** finished {func_name} ({time.time() - start_time:.2f}s) **")
                return res
            except Exception as e:
                raise

        return wrapper

    return decorator


# from langsmith import traceable
# @traceable(name="run_workflow", tags=["workflow", "demo"])
# Using the custom tracing decorator
@custom_traceable(name="run_workflow", tags=["workflow", "demo"])
def run_workflow(messages, config):
    response = model.invoke(messages, config=config)
    return response.content


if __name__ == "__main__":
    print("Running workflow with custom tracing decorator...")
    messages = [
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content="Hello, start the workflow tracing."),
    ]
    all_config = RunnableConfig(
        metadata={
            "user_id": "user_12345",
            "session_id": "session_67890",
            "request_type": "question",
            "app_version": "1.0.0",
        },
        tags=["workflow", "demo", "step1", "step2", "step3"],
    )

    config = RunnableConfig(
        metadata={**all_config.get("metadata", {}), "workflow_step": "initial"},
        tags=["step1"],
    )
    result = run_workflow(messages, config)
    print("Workflow result:", result)

```



## Attention

- LLM 返回的 JSON 可能包含 Markdown 代码块，需要配合 `strip`、`json`模块、`re`模块和异常捕获安全解析
- LLM 返回的 content 可以用`strip()`清理一下
- 关注 token使用、调用延迟、错误处理与追踪
- 权衡模型能力、RAG、微调、强化学习

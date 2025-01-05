---
draft: false

title: "NLP Basic"
description: "从自然语言处理到大模型"
date: 2024-12-22
author: ["biglonglong"]

tags: ["summary", "research", "ai", "nlp"]
summary: ""

math: true
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

## NLP与大模型基础

- 目标：实现机器智能（Tuning Test），而人类语言是人类智能的一个重要体现，NLP是方法之一
- 任务：词性标注（Part of speech）、实体识别（Named entity recognition）、共指消解（Co-reference）、依赖句法（Basic dependencies）、分词（jieba）
- 应用：文本匹配|推荐系统、知识图谱|机器阅读、对话系统、机器翻译、情感分析
- 组成：
  - 词表示（Word Embedding）：能够计算词之间相似度（words similarity）和关系（words relation），主流上使用上下文（context）词向量
  - 语言模型（Language Model）：$P(w_1,w_2,...,w_n)= \prod \limits_{i=1}^n{P(w_i|w_1,w_2,...,w_{i-1})}$，主流上使用神经网络（neural network with more data and params alone parallel）统计拟合
    - 神经元（neuron）：$h_{\textbf{w,b}}(\textbf{x})=f(\textbf{w}^T \textbf{x} + \textbf{b})$
    - 层（layers）：input layer$\rightarrow$ hidden layers $\rightarrow$ output layer(linear/sigmod/softmax)
    - 反向传播（back propagation）：LOSS(Mean-squared-error,Cross-entropy)' gradient chain
    - 学习率（learning rate）： $ \textbf{w|b}$ updated by $\alpha \Delta \textbf{w|b}$

### Word2Vec

使用滑动窗口上下文，将词汇经过神经网络映射到连续向量空间，包含词相似度和词之间的关系

- Negative sampling|Hierarchical softmax：提高计算效率
- Sub-sampling：平衡常见词和罕见词的采样概率
- soft sliding window：提高泛化能力

![Word2Vec](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/Word2Vec.png)

### simpleRNN

处理序列数据，通过循环连接允许信息在序列的各个时间步之间传递，每个时间步的输出取决于当前时刻的输入和上一时刻的隐藏状态，这种隐藏状态包含了上文信息

- param sharing：泛化到不同长度的样本，提高计算效率
- gradient vanish or explode：接受了太长时间步的信息
- no parallel：序列计算方式，训练较慢

![simpleRNN](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/simpleRNN.png)

### LSTM

门控RNN结构，遗忘门（forget gate to）淡化过去的时间步信息，输入门（input gate）得到当前时间步信息，输出门（output gate）激活当前时间步信息，解决了梯度问题

![LSTM](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/LSTM.png)

### GRU

门控RNN结构，重置门$r_t$（reset gate）用于激活过去的时间步信息，更新门$z_t$（update gate）用于平衡过去和当前时间步信息的权重，解决了梯度问题，降低了结构复杂性

![GRU](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/GRU.png)

### Bid RNN

考虑当前时间步下上文和下文的信息

![Bid_RNNs](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/Bid_RNNs.png)

### CNN

通过卷积操作获取局部信息

![CNN](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/CNN.png)

### Attention

动态分配不同时间步的权重以突出重要时间步信息，解决了信息瓶颈、梯度消失、可解释性问题

- Scores：e = $s^TWh_i$、$v^Ttanh(W_1h_i + W_2s)$

![Attention](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/Attention.png)

### Transformer

，解决了并行计算的问题，但模型复杂、超参敏感、优化困难

- Input：byte pair encoding + positional encoding
- Hidden：serveral encoder/decoder blocks
  - Scale、Residual connection and Layer normalization：防止梯度消失或者梯度爆炸
  - dropout：防止过拟合
  - mask：前向顺序生成逻辑
  - …
- Output：linear -> softmax -> corss entropy

![Transformer](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/Transformer.png)

### PLM

迁移学习范式(transfer learning)：Model Based(Large -scale Unlabeled Data) -> Model Fine-tuning(Task-specific Training Data) -> Final Model(Data)

在预训练模型参数初始化的基础上，对任务设定独特的训练策略Fine Tuning，如representation、layers

- GPT：大量的数据样本和复杂的Transformer结构，在NLP的 few shot 和 in-context learning ability中表现良好
- BERT：”完形填空“（Mask）训练目标，可能在NLP中存在一些问题，但是在跨模态中可能具有一定的研究价值
- T5：序列预测（sequence to sequence）

> **Transformers （Fine-tuning） turtorial**：
>
> ```python
> from transformers import pipeline
> question_answerer = pipeline('question-answering')
> question_answerer({
> 'question': 'What is the name of the repository ?’,
> 'context': 'Pipeline has been included in the huggingface transformers repository'
> })
> ```
>
> ```python
> # load_dataset\load_metric
> from transformers import AutoTokenizer, AutoModelForSequenceClassification
> tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
> model = AutoModelForSequenceClassification.from_pretrained('bert-baseuncased')
> 
> inputs = tokenizer(”Hello World!”, return_tensors='pt')
> outputs = model(**inputs)
> model.save_pretrained("path_to_save_model")
> 
> trainer = Trainer(
> model,
> args,
> train_dataset=encoded_dataset["train"],
> eval_dataset=encoded_dataset["validation"],
> tokenizer=tokenizer,
> compute_metrics=compute_metrics
> )
> trainer.train() # Start training!
> trainer.evaluate()
> ```

#### Prompt learning

不再微调模型的结构和参数（困难），只是“无脑”地堆叠体量，这样的模型居然能够根据输入的Prompt(Input + Template )产生特定任务的模型调整，这一点着实迷惑，但确实体现了这是“机器智能”的雏形。

Prompt构造也是比较玄学的，目前也在探索研究中！下面几点可以参考：

- Pre-trained Model的选择：GPT类模型（生成）要求MASK在最后，而BERT类模型（理解）要求MASK在上下文中，T5类模型则比较通用
- Template：为了引导模型生成所需的输出而设计的输入格式或结构，这些模板可以帮助模型更好地理解任务要求，并生成更准确和相关的结果，包括约束、结构化、embedding预测等
- Verbalizer：将模型输出的标签映射到自然语言词汇，如知识扩充

#### Delta Tuning

微调模型的一小部分

- Addition-based：在模型中添加一些小模型结构，训练过程中仅改变这部分参数；或者在隐层中添加一些soft token
- Specification-based：只微调模型参数中的特定部分，如bias
- Reparameterization-based：参数降维



## 参考文献

- [OpenBMB - 让大模型飞入千家万户](https://www.openbmb.cn/community/course)
---
draft: true

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
- 应用：文本匹配|推荐系统、知识图谱|机器阅读、对话系统、机器翻译、情感分析|意见挖掘
- 组成
  - 词表示（Word Embedding）：能够计算词相似度（words similarity）和词之间关系（words relation），主流上使用上下文（context）词向量
  - 语言模型（Language Model）：$P(w_1,w_2,...,w_n)= \prod \limits_{i=1}^n{P(w_i|w_1,w_2,...,w_{i-1})}$，主流上使用神经网络（neural network with more data and params alone parallel）统计拟合
    - neuron：$h_{\textbf{w,b}}(\textbf{x})=f(\textbf{w}^T \textbf{x} + \textbf{b})$
    - layers：$\text{input layer} \rightarrow \text{hidden layers} \rightarrow \text{output layer(linear/sigmod/softmax)}$
    - back propagation：$\text{LOSS(Mean-squared-error,Cross-entropy)' gradient chain}$
    - learning rate：$\textbf{w|b}_{new}=\textbf{w|b}_{old}-\alpha \Delta \textbf{w|b}$



## Word2Vec

> 



-  context-target train network from one-hot
  - imporve computational efficiency
    - Negative sampling
    - Hierarchical softmax
  - rare words balance：Sub-sampling
  - generalization capability：soft sliding window



- RNN：sequential memory during processing sequence data  by sharing parameters at each time step of the sequence. But it’s difficult to access information from many steps back and may lead to gradient vanish or explode.
- GRU：introduce gating mechanism into RNN by reset gate to active steps back and update gate to balance step now and steps back.
- LSTM：more gating mechanism into RNN by forget gate to forget previous cell state, input gate to get some current cell state and output gate to activate current information.
- Bid RNNs：consider context both forward and backward information of the input sequence.
  - preventing overfitting：dropout
- CNN：get local features by convolution calculation，such as Conv,  Max-pooling, Non-linear
- Attention Mechanism：highlight important information by dynamically assign weights to different steps.
- Transformer
- Pretrained language model(transfer learning)：Model Pre-training(Large -scale Unlabeled Dara) -> Model Fine-tuning(Task-specific Training Data) -> Final Model(Data)
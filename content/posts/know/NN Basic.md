---
draft: false

title: "NN Basic"
description: "主流神经网络模型结构及其思想"
date: 2025-07-15
author: ["biglonglong"]

tags: ["summary", "research", "ai", "nn"]
summary: ""

math: true
weight: 401
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



## Env

```bash
# install IDE anaconda 
conda create -n pytorch python==3.8
conda env list
conda activate pytorch
conda deactivate
conda list
# install nvidia GetForce Driver
nvidia-smi
# install pytorch ...
conda install pytorch==1.10.1 torchvision==0.11.2 torchaudio==0.10.1 cudatoolkit=11.3 -c pytorch
```



## NN

$$
\textbf{y} = model(\textbf{x}) \quad
model = h_L \circ h_{L-1} \circ \cdots \circ h_1
$$

- 神经元（neuron）：计算基本单元，通常采用 $h_{\textbf{w,b}}(\textbf{x})=f(\textbf{w}^T \textbf{x} + \textbf{b})$  的形式处理上一层的输出

  - 权重（$\textbf{w}^T$）：控制每个输入特征对神经元输出的影响程度
  - 偏置（$\textbf{b}$）：调节激活函数的触发阈值
  - 激活函数（$f$）：引入非线性使网络能拟合复杂函数，控制神经元的激活与抑制，影响反向传播的梯度流动

- 层（layers）：由多个神经元组合而成，一般神经网络结构依次为输入层（input layer），负责接收原始数据 $\rightarrow$ 隐藏层（hidden layers），网络不同在于该层特殊结构 $\rightarrow$ 输出层（output layer），根据目标归纳为最终预测

- 损失函数（loss function）：衡量预测值与真实值的差异

系统训练过程：首先进行**前向传播**（模型计算过程），通过输入数据得到预测输出；随后利用**损失函数**计算预测值与真实值之间的误差，并通过**链式法则**推导出各参数关于损失函数的梯度；接着执行**反向传播**（back propagation），利用合适的**优化器（optimizer）**，基于梯度下降法，在一定学习率（learning rate）下计算参数更新$\Delta \textbf{w}$和$\Delta \textbf{b}$，从而优化模型参数；通过多次**迭代**，模型逐步调整权重和偏置，最终使前向传播后损失函数计算的误差达到最小，从而获得性能较优的模型。



## Activation Function

为避免多层神经网络退化为单层结构（即仅等效于单个神经元的功能），同时确保深度网络能够有效处理高维复杂任务，需在每个神经元中引入非线性激活函数：

### Sigmod

$$
\sigma(x) = \frac{1}{1 + e^{-x}}
\longrightarrow
\sigma'(x) = \sigma(x) \cdot (1 - \sigma(x))
$$

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/sigmoid.png" alt="sigmoid" style="zoom: 25%;" />

输出范围在 (0,1) 之间；单调递增；0不对称；光滑（连续可导）；反向传播中计算高效；当输入值很大或很小时，梯度消失，训练耗时；常用于将实数映射到概率；

### Tanh

$$
\tanh(x) = \frac{e^{x} - e^{-x}}{e^{x} + e^{-x}} \longrightarrow
\tanh'(x) = 1 - \tanh^2(x)
$$

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/tanh.png" alt="tanh" style="zoom: 67%;" />

输出值范围在 (-1,1) 之间；单调递增；0对称，具有正负一致性；光滑（连续可导）；反向传播中收敛高效； 当输入值很大或很小时，梯度消失，训练耗时；常用于数据归一化；

### ReLU

$$
\text{ReLU}(x) = 
\begin{cases} 
    x & \text{if } x > 0 \\
    0 & \text{if } x \leq 0
\end{cases}
\longrightarrow
\text{ReLU}'(x) = 
\begin{cases} 
    1 & \text{if } x > 0 \\
    0 & \text{if } x \leq 0
\end{cases}
$$

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/relu.png" alt="relu" style="zoom:67%;" />

输出值范围在 (0, +inf) 之间；分段；0不对称；反向传播中收敛高效；可能存在神经元死亡；常用于加速网络训练；

### Leaky ReLU

$$
f(x) = 
\begin{cases} 
    x & \text{if } x \geq 0 \\
    \alpha x & \text{if } x < 0
\end{cases}
\longrightarrow
f'(x) = 
\begin{cases} 
    1 & \text{if } x \geq 0 \\
    \alpha & \text{if } x < 0
\end{cases}
$$

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/leakyRelu.png" alt="leakyRelu" style="zoom: 67%;" />

输出值范围在 (-inf, +inf) 之间；分段；0不对称；反向传播中收敛高效；参数不好确定；常用于解决梯度消失；



## Loss Function

通过损失函数对所有参数应用链式法则计算偏导数（即梯度），随后以预设的学习率$\alpha$沿梯度下降方向更新参数，使得下次迭代时损失函数计算的误差降低：

$$
\textbf{w}_{new} = \textbf{w}_{old} - \alpha \frac{\partial J(w)}{\partial w} \quad
\textbf{b}_{new} = \textbf{b}_{old} - \alpha \frac{\partial J(b)}{\partial b}
$$

### Mean Squared Error

$$
J(x) = \frac{1}{2n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

优点：梯度稳定，训练高效；适合大规模严格回归任务；

缺点：平方项会放大离群点的误差，导致模型过度拟合异常值，鲁棒性较差；

### Cross Entropy



## Optimizer

### SGD

### Adam



## Train/Test Focus

> 参数量、过拟合

- 数据清洗（异常、NULL）、数据分布、数据处理（归一化）
- 批次（batch）大小
- 激活函数
- 损失函数
- 学习率
- 训练轮次
- 收敛问题：权重初始化、批次更新机制



## FCNN/MLP                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/FCNN.jpg" alt="FCNN" style="zoom: 33%;" />
$$
L_i(n_i) -> L_j(n_j): \quad
\begin{align*}
    \mathbf{W}_{ij} | \mathbf{b}_j  = 
    \begin{bmatrix}
        w_{11} & w_{12} & \cdots & w_{1n_i} \\
        w_{21} & w_{22} & \cdots & w_{2n_i} \\
        \vdots & \vdots & \ddots & \vdots \\
        w_{n_j1} & w_{n_j2} & \cdots & w_{n_j n_i}
    \end{bmatrix}
    \begin{bmatrix}
        b_1 \\ 
        b_2 \\ 
        \vdots \\
        b_{n_j}
    \end{bmatrix}
\end{align*}
$$

- 全连接（full connect）：相邻层所有神经元之间均相互连接，同一层神经元之间无连接；

优点：易于实现，可拟合任意连续函数；擅长学习输入数据的全局模式；

缺点：参数量大，计算成本高；局部模式（如图像空间信息）捕捉能力弱，需手动设计特征；



## CNN

### simpleCNN

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/cnn.png" alt="cnn" style="zoom: 50%;" />
$$
OH = \frac{H + 2P - FH}{S} + 1  \quad
OW = \frac{W + 2P - FW}{S} + 1
$$

- 特征提取（feature extraction）：
  - 卷积（convolutions）：考虑步幅、填充，提取原数据中卷积核特征相同的区域，产生通道数和特征图大小的变化；
  - 池化（pooling）/ 下采样（subsampling）：考虑步幅、填充，按感受野数据降维，减弱对输入小幅平移的敏感程度，产生特征图大小的变化；
  - 参数共享（param share）：同一卷积核在输入不同位置滑动并复用参数，计算效率高；

优点：适合处理网格状数据；

缺点：输入矩阵大小固定；需要大量标注数据；解释性较弱；

### [LeNet-5](https://vitalab.github.io/article/2017/03/29/lenet.html)

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/lenet-5.png" alt="lenet-5" style="zoom:67%;" />

| 层类型（5）                 | 参数设置                         | 输出尺寸                  |
| :-------------------------- | :------------------------------- | :------------------------ |
| **Input**                   | 32×32×1（原始 MNIST 输入大小）   | 32×32 灰度图像            |
| **Conv1**（Sigmoid/Tanh）   | 6 个 5×5 卷积核，步长 1，填充 0  | 28×28×6                   |
| **Subsampling1**（Average） | 2×2 平均池化，步长 2，填充 0     | 14×14×6                   |
| **Conv2**（Sigmoid/Tanh）   | 16 个 5×5 卷积核，步长 1，填充 0 | 10×10×16                  |
| **Subsampling2**（Average） | 2×2 平均池化，步长 2，填充 0     | 5×5×16                    |
| **FC3**（ReLU、Flatten）    | 120 个神经元                     | 120×1                     |
| **FC4**（ReLU）             | 84 个神经元                      | 84×1                      |
| **Output**（Softmax）       | 10 个神经元                      | 10×1（对应 0-9 数字分类） |

- 经典层级结构：卷积+池化+全连接；

优点：大幅减少参数量，计算效率高；

缺点：硬件条件使得只适合小数据集；平均池化会模糊特征；sigmoid激活容易导致梯度消失，训练稳定性较差；全连接层占大部分参数易过拟合；

### [AlexNet](https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)

![alexnet](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/alexnet.jpg)

| 层类型（8）                       | 参数设置                               | 输出尺寸                          |
| :-------------------------------- | :------------------------------------- | :-------------------------------- |
| **Input**                         | 224×224×3（ImageNet输入大小）          | 227×227×3 RGB图像（双GPU并行）    |
| **Conv1**（ReLU）                 | 96 个 11×11×3 卷积核，步长 4，填充 0   | 55×55×96                          |
| **Pooling1**（Max）               | 3×3 池化，步长 2，填充 0               | 27×27×96                          |
| **Conv2**（ReLU）                 | 256 个 5×5×96 卷积核，步长 1，填充 2   | 27×27×256                         |
| **Pooling2**（Max）               | 3×3 池化，步长 2，填充 0               | 13×13×256                         |
| **Conv3**（ReLU）                 | 384 个 3×3×256  卷积核，步长 1，填充 1 | 13×13×384                         |
| **Conv4**（ReLU）                 | 384 个 3×3×384 卷积核，步长 1，填充 1  | 13×13×384                         |
| **Conv5**（ReLU）                 | 256 个 3×3×384 卷积核，步长 1，填充 1  | 13×13×256                         |
| **Pooling5**（Max）               | 3×3 池化，步长 2，填充 0               | 6×6×256                           |
| **FC6**（ReLU、Flatten、Dropout） | 4096 个神经元                          | 4096                              |
| **FC7**（ReLU、Dropout）          | 4096 个神经元                          | 4096                              |
| **FC8**（Softmax）                | 1000 个神经元                          | 1000（对应 ImageNet 1000 类分类） |

- 数据增强（data augmentation）：通过翻转、裁剪、PCA等操作，提高数据量同时防止过拟合；

- 随机失活（dropout）：每轮迭代时，随机去除层间部分神经元的连接，关闭前向传播和反向传播，预防参数多的层过拟合；

- 局部响应归一化/正则化（LRN）：按通道对每个位置进行归一化，使得大值更大，增强局部对比度，提升鲁棒性，其实作用不大；
  $$
  b_{x,y}^i = \frac{a_{x,y}^i}{\left( k + \alpha \sum_{j=\max(0, i-n/2)}^{\min(N-1, i+n/2)} (a_{x,y}^j)^2 \right)^\beta}
  $$
  
- ReLU激活：梯度稳定，收敛加快；

- 最大池化（max pooling）： 保留显著特征；

优点：硬件条件使得适合更大数据集、网络层数更深；

缺点： 参数量大，计算成本高；大卷积核效率低；

### [VGG-16](https://arxiv.org/abs/1409.1556)

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/vgg.png" alt="vgg" style="zoom: 67%;" />

| 层类型（16）                      | 参数配置                          | 输出尺寸                          |
| :-------------------------------- | :-------------------------------- | :-------------------------------- |
| **Input**                         | 224×224×3（ImageNet输入大小）     | 224×224×3 RGB图像                 |
| **Conv1_1**（ReLU）               | 64 个 3×3 卷积核，步长 1，填充 1  | 224×224×64                        |
| **Conv1_2**（ReLU）               | 64 个 3×3 卷积核，步长 1，填充 1  | 224×224×64                        |
| **Pooling1**（Max）               | 2×2 池化，步长 2，填充 0          | 112×112×64                        |
| **Conv2_1**（ReLU）               | 128 个 3×3 卷积核，步长 1，填充 1 | 112×112×128                       |
| **Conv2_2**（ReLU）               | 128 个 3×3 卷积核，步长 1，填充 1 | 112×112×128                       |
| **Pooling2**（Max）               | 2×2 池化，步长 2，填充 0          | 56×56×128                         |
| **Conv3_1**（ReLU）               | 256 个 3×3 卷积核，步长 1，填充 1 | 56×56×256                         |
| **Conv3_2**（ReLU）               | 256 个 3×3 卷积核，步长 1，填充 1 | 56×56×256                         |
| **Conv3_3**（ReLU）               | 256 个 3×3 卷积核，步长 1，填充 1 | 56×56×256                         |
| **Pooling3**（Max）               | 2×2 池化，步长 2，填充 0          | 28×28×256                         |
| **Conv4_1**（ReLU）               | 512 个 3×3 卷积核，步长 1，填充 1 | 28×28×512                         |
| **Conv4_2**（ReLU）               | 512 个 3×3 卷积核，步长 1，填充 1 | 28×28×512                         |
| **Conv4_3**（ReLU）               | 512 个 3×3 卷积核，步长 1，填充 1 | 28×28×512                         |
| **Pooling4**（Max）               | 2×2 池化，步长 2，填充 0          | 14×14×512                         |
| **Conv5_1**（ReLU）               | 512 个 3×3 卷积核，步长 1，填充 1 | 14×14×512                         |
| **Conv5_2**（ReLU）               | 512 个 3×3 卷积核，步长 1，填充 1 | 14×14×512                         |
| **Conv5_3**（ReLU）               | 512 个 3×3 卷积核，步长 1，填充 1 | 14×14×512                         |
| **Pooling5**（Max）               | 2×2 池化，步长 2，填充 0          | 7×7×512                           |
| **FC6**（ReLU、Flatten、Dropout） | 4096 个神经元                     | 4096                              |
| **FC7**（ReLU、Dropout）          | 4096 个神经元                     | 4096                              |
| **FC8**（Softmax）                | 1000 个神经元                     | 1000（对应 ImageNet 1000 类分类） |

- 块状（block）简洁结构：卷积带填充保持分辨率，最大池化减半，可移植性强；
- 小卷积核：参数少，训练效果和大卷积核差不多；

优点：参数多，理解力强；

缺点：参数多，算力要求高；网络深，易梯度消失或梯度爆炸，依赖权重初始化；

### [GoogLeNet](https://arxiv.org/abs/1409.4842)

![googlenet](https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/googlenet.png)

| 层类型（22）                        | 参数配置                         | 输出尺寸                          |
| :---------------------------------- | :------------------------------- | :-------------------------------- |
| **Input**                           | 224×224×3（ImageNet输入大小）    | 224×224×3 RGB图像                 |
| **Conv1**（ReLU）                   | 64 个7×7 卷积核，步长 2，填充 3  | 112×112×64                        |
| **Pooling1**（Max）                 | 3×3 池化，步长 2，填充 1         | 56×56×64                          |
| **Conv2**（ReLU）                   | 64 个1×1 卷积核，步长 1，填充 0  | 56×56×64                          |
| **Conv3**（ReLU）                   | 192 个3×3 卷积核，步长 1，填充 1 | 56×56×192                         |
| **Pooling3**（Max）                 | 3×3 池化，步长 2，填充 0         | 28×28×192                         |
| **Inception 4a~4b**                 | 2 个 Inception 模块              | 28×28×480                         |
| **Pooling4**（Max）                 | 3×3 池化，步长 2，填充 0         | 14×14×480                         |
| **Inception 5a~5e**                 | 5 个 Inception 模块              | 14×14×832                         |
| **Pooling5**（Max）                 | 3×3 池化，步长 2，填充 0         | 7×7×832                           |
| **Inception 6a~6b**                 | 2 个 Inception 模块              | 7×7×1024                          |
| **Pooling6**（ALL Average）         | 7×7 全局平均池化                 | 1×1×1024                          |
| **FC**（Flatten、Softmax、Dropout） | 1000 个神经元                    | 1000（对应 ImageNet 1000 类分类） |

- Inception 模块：含 1×1、3×3、5×5 卷积和池化分支
  - 多尺度特征融合：并行应用不同尺寸的卷积核和池化，输出**保持高宽不变**，在**通道维度**（超参）上连接，捕捉不同感受野的特征，特征提取能力强；
  - 1×1 卷积降维：实现上一层特征图跨通道的交互和信息整合；减少通道数，降低计算量；
  - 并行分支：“宽而浅”的设计，实现高精度低计算量；
- 全局平均池化（GAP）：输出只和通道数相关，替代全连接层，大幅减少参数量，抑制过拟合但易信息丢失；
- 辅助分类器（Auxiliary Classifiers）：在中间层添加辅助 Softmax 输出，增强梯度回传，缓解深层网络梯度消失问题，避免过拟合，效果有限；

优点：计算高效，参数量少；

缺点：结构复杂，调试困难；对小数据集易过拟合；

### [ResNet-18](https://arxiv.org/abs/1512.03385)

<img src="https://cdn.jsdelivr.net/gh/biglonglong/ImageHost/posts/resnet18.jpg" alt="resnet8" style="zoom: 67%;" />

| **层类型**（18）                    | 参数配置                                                   | 输出尺寸                          |
| :---------------------------------- | :--------------------------------------------------------- | :-------------------------------- |
| **Input**                           | 224×224×3（ImageNet输入大小）                              | 224×224×3 RGB图像                 |
| **Conv1**（ReLU、BN）               | 64 个 7×7卷积核，步长2，填充 3                             | 112×112×64                        |
| **Pooling1**（Max）                 | 3×3最大池化，步长2，填充 1                                 | 56×56×64                          |
| **Stage1**                          | 2 个残差块（每个块含 2 个 3×3 卷积，直连跳跃连接）         | 56×56×64                          |
| **Stage2**                          | 2 个残差块（每个块含 2 个 3×3 卷积，前一个下采样跳跃连接） | 28×28×128                         |
| **Stage3**                          | 2 个残差块（每个块含 2 个 3×3 卷积，前一个下采样跳跃连接） | 14×14×256                         |
| **Stage4**                          | 2 个残差块（每个块含 2 个 3×3 卷积，前一个下采样跳跃连接） | 7×7×512                           |
| **Pooling5**（ALL Average）         | 全局平均池化                                               | 1×1×512                           |
| **FC**（Flatten、Softmax、Dropout） | 1000 个神经元                                              | 1000（对应 ImageNet 1000 类分类） |

- 残差块（Stage）

  - 跳跃连接（Skip Connection）：提供直连或 1x1 卷积，输出**各维度保持一致**，缓解【深度网络-梯度消失/爆炸】无法保持恒等状态而模型退化的问题，允许网络选择性地学习残差$F(X) - x$，至少不会比浅层网络更差；

  $$
  F(x) = H(x) + x
  $$

  - 批量归一层（Batch Normslize）：$ \gamma, \beta$持续训练，特征图数据调整（统一量纲、移动数据分布区间到激活函数高梯度范围），加快模型收敛速度，使模型更稳定
    $$
    y_i = \gamma \cdot \left( \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}} \right) + \beta \\
    \mu_B = \frac{1}{m}\sum_{i=1}^m x_i
    \quad
    \sigma_B^2 = \frac{1}{m}\sum_{i=1}^m (x_i - \mu_B)^2 \quad
    \epsilon > 0
    \quad
    \gamma, \beta
    $$

优点：为深度学习打下基础；迁移学习：作为预训练模型效果好；

缺点：跳跃连接可能引入噪声；











































## Other

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


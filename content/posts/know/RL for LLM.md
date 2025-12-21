---
draft: true

title: "RL for LLM"
description: "强化学习助力大模型，智能体训练、仿真平台、奖励设计"
date: 2025-11-25
author: ["biglonglong"]

tags: ["summary", "research", "ai", "llm", "rl", "post training"]
summary: ""

math: true
weight: 304
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

 

## Policy Gradient Methods

传统策略梯度算法：

1. **步长难以选择**：太小收敛慢，太大容易导致策略崩溃
2. **样本效率低**：需要大量采样才能获得稳定的梯度估计
3. **更新不稳定**：一次坏的更新可能让策略完全失效，训练过程波动大

> - $ \theta $：当前策略（旧策略）的参数
> - $ \theta' $：优化后策略（新策略）的参数
> - $ \pi_{\theta}(a|s) $：策略 $\theta$ 在状态 $ s $ 下选择动作 $ a $ 的概率
> - $ \rho_{\theta} $：策略 $\theta$ 下状态访问分布，短期内会认为保持不变
> - $\delta_t$：t 时刻单步优势估计

与SFT相比，不允许强散度的微调

| 方法        | 核心思想                 | 优点                                       | 缺点                                                   |
| ----------- | ------------------------ | ------------------------------------------ | ------------------------------------------------------ |
| TRPO        | 信任区域约束下的策略优化 | 理论保证单调提升                           | 计算复杂，需计算二阶信息                               |
| PPO-penalty | KL散度作为惩罚项         | 优化更简单                                 | 需调优惩罚系数 $\beta$                                 |
| PPO-clip    | 截断重要性采样比率       | 实现简单，稳定高效                         | 引入超参数 $\epsilon$                                  |
| DPO         | 直接偏好优化             | 训练稳定高效，无需奖励模型，避免奖励过优化 | 依赖高质量偏好数据，难以在线迭代，理论基于特定偏好模型 |
| GRPO        | 分组相对策略优化         | 稳定训练，鼓励多样性                       | 需要分组采样设计                                       |

### TRPO

要求在**信任区域约束**下优化策略，利用优势函数保证策略更新后性能**单调提升**
$$
\max_{\theta'} \mathbb{E}_{s \sim \rho_{\theta}, a \sim \pi_{\theta}(\cdot|s)} \left[ \frac{\pi_{\theta'}(a|s)}{\pi_{\theta}(a|s)} A^{\pi_{\theta}}(s,a) \right]  \text{s.t. } D_{KL}\big( \pi_{\theta}(\cdot|s) \parallel \pi_{\theta'}(\cdot|s) \big) \le \delta
$$

- $ A^{\pi_{\theta}}(s,a) $：**优势函数**，表示在状态 $ s $ 下采取动作 $ a $ 相对于该策略的平均动作价值好多少（即 $ Q(s,a) - V(s) $），能够减小方差，减小振荡，加快收敛
  - 大于 0 时，梯度会增大选择这个好动作的概率，从而 max 优势
  - 小于 0 时，梯度会减少选择这个坏动作的概率，从而 max 优势
- $\frac{\pi_{\theta'}(a|s)}{\pi_{\theta}(a|s)}$：**重要性采样**，采样来自当前策略 $ \pi_{\theta} $，对优势函数加权重要性
  - 大于 1 时，新策略该状态 $ s $ 下选择动作 $ a $ 概率增大，加强这种梯度，增大了方差
    - ==最大化此式而不加限制，仍然会导致策略更新幅度过大==
  - 小于 1 时，新策略该状态 $ s $ 下选择动作 $ a $ 概率减小，减弱这种梯度，减小了方差
- $ D_{\text{KL}}(\pi_{\theta}(\cdot|s) \parallel \pi_{\theta'}(\cdot|s)) $：给定状态 $ s $，旧策略对新策略的 **KL 散度**，衡量概率分布 $ p $ 与 $ q $ 之间的差异
  - 当两个策略在每个状态的动作分布相同时为 0
  - 新策略与旧策略的动作分布不能相差太远，从而**限制每次策略更新的步长**，保证单调提升且稳定

### GAE

- **蒙特卡洛多步估计**：低方差，高偏差
  $$
  \delta_t = \sum_t^{\infty} \gamma^t r_t
  $$

- **时序差分单步估计**：高方差，低偏差
  $$
  \delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)
  $$

- **广义多步优势估计**：平衡方差和偏差，平衡收敛速度和优化效果

  - 多步优势函数可写为：
    $$
    \begin{aligned}
    A_t^{(1)} &= \delta_t \\
    A_t^{(2)} &= \delta_t + \gamma \delta_{t+1} \\
    A_t^{(k)} &= \delta_t + \gamma \delta_{t+1} + \dots + \gamma^{k-1} \delta_{t+k-1}
    \end{aligned}
    $$

  - 对多步优势函数的指数加权平均，平衡单步和多步带来的方差和偏差：
    $$
    A_t^{GAE} = (1-\lambda) \left( A_t^{(1)} + \lambda A_t^{(2)} + \lambda^2 A_t^{(3)} + \cdots \right)
    $$

  - 代入 $\delta_t$ 展开并整理，得到简洁形式：
    $$
    A_t^{GAE} = \sum_{i=0}^{\infty} (\gamma \lambda)^i \delta_{t+i}
    $$

  - $\lambda$ 是 GAE 超参数，控制偏差与方差的权衡（$\lambda=0$ 为 TD(0)，$\lambda=1$ 为蒙特卡洛）

### D~KL

对于两个离散概率分布 $P$ 和 $Q$，其KL散度定义为：

$$
D_{\text{KL}}(P \parallel Q) = \sum_{i} P(i) \log \frac{P(i)}{Q(i)}
$$
对于两个连续概率密度函数 $p(x)$ 和 $q(x)$，其KL散度定义为：

$$
D_{\text{KL}}(P \parallel Q) = \int_{-\infty}^{\infty} p(x) \log \frac{p(x)}{q(x)} \, dx
$$

1. 非负性：$D_{\text{KL}}(P \parallel Q) \geq 0$，等号成立当且仅当 $P = Q$ ，当存在 $P(x)>0 | Q(x)=0$时取无穷大
2. 非对称性：$D_{\text{KL}}(P \parallel Q) \neq D_{\text{KL}}(Q \parallel P)$，KL散度不是真正的距离度量
3. 信息论：KL散度可以表示为交叉熵与熵的差 $D_{\text{KL}}(P \parallel Q) = H(P, Q) - H(P)$

衡量的是**用Q近似P**时的信息损失，

### PPO-penalty

将 KL 散度约束转化为惩罚项，避免硬约束带来的优化停滞，通过自适应调整惩罚系数 $\beta$ 来控制策略更新幅度。
$$
\max_{\theta'} \mathbb{E}_{s \sim \rho_{\theta}} \mathbb{E}_{a \sim \pi_{\theta}(\cdot|s)} \left[ \frac{\pi_{\theta'}(a|s)}{\pi_{\theta}(a|s)} \hat{A}^{\pi_{\theta}}(s,a) - \beta D_{KL}\big[ \pi_{\theta}(\cdot|s) \parallel \pi_{\theta'}(\cdot|s) \big] \right] \quad \beta \leftarrow 
\begin{cases} 
\beta / 2 & \text{if } D_{KL} < \delta / 1.5 \\ 
\beta \times 2 & \text{if } D_{KL} > \delta \times 1.5 
\end{cases}
$$

- $-\beta D_{KL}\big[ \pi_{\theta}(\cdot|s) \parallel \pi_{\theta'}(\cdot|s) \big]$：散度惩罚项，**阻止策略偏离旧策略太远**
  - 散度较小，新旧策略接近，减小 $\beta$ ，允许更大步长更新，加速学习
  - 散度较大，新旧策略偏离，增大 $\beta$ ，使策略更新更保守，防止策略崩溃

### PPO-clip

直接限制重要性采样比率（新旧策略概率比）的偏离范围，避免过大的策略更新，计算更简单、更稳定
$$
\max_{\theta'} \mathbb{E}_{s \sim \rho_{\theta}} \mathbb{E}_{a \sim \pi_{\theta}(\cdot|s)} \min \left\{ 
\frac{\pi_{\theta'}(a|s)}{\pi_{\theta}(a|s)} \hat{A}^{\pi_{\theta}}(s,a), \;
\text{clip}\left( \frac{\pi_{\theta'}(a|s)}{\pi_{\theta}(a|s)}, 1 - \epsilon, 1 + \epsilon \right) \hat{A}^{\pi_{\theta}}(s,a) 
\right\}
$$

- $\text{clip}\left( \frac{\pi_{\theta'}(a|s)}{\pi_{\theta}(a|s)}, 1 - \epsilon, 1 + \epsilon \right)$：限制策略更新幅度
  - 当优势函数为正时，限制策略过度提升动作概率（避免过拟合）
  - 当优势函数为负时，限制策略过度降低动作概率（保持探索能力）
-  $\epsilon$ ：截断偏离超参数，控制信任区域大小
-  散度作为奖励使用

### DPO

在给定的人类偏好数据上，直接优化策略模型，使其输出更符合人类偏好的响应，而无需显式地训练一个奖励模型或进行复杂的策略梯度优化，鼓励（优选回答的隐式奖励 - 劣选回答的隐式奖励）越大越好
$$
\mathcal{L}_{\text{DPO}}(\pi_\theta; \pi_{\text{ref}}) = -\mathbb{E}_{(x, y_w, y_l) \sim \mathcal{D}} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)} \right) \right]
$$

- $\log \frac{\pi_\theta(y|x)}{\pi_{\text{ref}}(y|x)}$：这一项充当了**隐式奖励**的角色。
  - 对于人类偏好 $y_w$，期待越大， 对于人类非偏好 $y_l$，期待越小
  - 如果$\pi_{\text{ref}}(y_w|x)$比较小，说明Ref模型未正确分类该偏好，此时$r_w$奖励很大
  -  如果$\pi_{\text{ref}}(y_{l}|x)$比较大，说明Ref模型正确分类该非偏好，此时$r_l$奖励很大
- $\beta$：控制**策略偏离参考策略的程度**。
  - $\beta$ 越大，对隐式奖励的“放大”越强，对偏好的拟合越强，但可能导致策略过度优化，降低生成多样性和违背 KL 约束。
  - $\beta$ 越小，策略越保守，越倾向于保持在 $\pi_{\text{ref}}$ 附近。

### GRPO

摆脱对复杂PPO算法和独立奖励模型的依赖，直接通过**组内候选回答的相对比较**来优化模型策略

1. 将绝对评分转化为相对偏好概率，求组内平均优胜概率

$$
P(y_i \succ y_j) = \frac{\exp(r(y_i))}{\exp(r(y_i)) + \exp(r(y_j))} = \sigma(r(y_i) - r(y_j)) \\
P_{\text{win}}(y_i \mid \mathcal{G}) = \frac{1}{N-1} \sum_{j \neq i} P(y_i \succ y_j) = \frac{1}{N-1} \sum_{j \neq i} \sigma(r(y_i) - r(y_j))
$$

2. 加权监督损失（对照TD损失反向传播）
   $$
   \mathcal{L}_{\text{pref}}(\theta) = - \mathbb{E}_{x \sim \mathcal{D}, \mathcal{G} \sim \pi_\theta} \left[ \sum_{i=1}^{N} P_{\text{win}}(y_i \mid \mathcal{G}) \cdot \log \pi_\theta(y_i \mid x) \right]
   $$

3. KL散度正则项
   $$
   \mathcal{L}_{\text{KL}}(\theta) \approx \mathbb{E}_{x, \mathcal{G}} \left[ \sum_{i=1}^{N} \log \frac{\pi_\theta(y_i \mid x)}{\pi_{\text{ref}}(y_i \mid x)} \right]
   $$

综上得到损失函数：
$$
\boxed{\mathcal{L}_{\text{GRPO}}(\theta) = \mathcal{L}_{\text{pref}}(\theta) + \beta \cdot \mathcal{L}_{\text{KL}}(\theta)} \\
=  - \mathbb{E}_{x, \mathcal{G}} \left[ \sum_{i=1}^{N} P_{\text{win}}(y_i \mid \mathcal{G}) \cdot \log \pi_\theta(y_i \mid x) \right] + \beta \cdot \mathbb{E}_{x, \mathcal{G}} \left[ \sum_{i=1}^{N} \log \frac{\pi_\theta(y_i \mid x)}{\pi_{\text{ref}}(y_i \mid x)} \right]
$$



## RL Details

1. 在价值估计收敛过程中，如果策略也同步改变，**收敛目标不断抖动**，导致训练不稳定（Bootstrap）

将**策略的“执行-改进”** 和**价值的“目标提供”** 这两个角色在时间上解耦

- 主网络：同时负责策略执行（与环境交互） 和价值更新（学习），它是快速变化的。
- 目标网络：仅负责提供价值更新的目标值。其参数（代表旧策略）在一段时间内被“冻结”（周期性更新为主网络），为主网络提供一个短期稳定的收敛目标。

------

2. 在线强化学习得到的样本连续相关，状态、动作、奖励在状态空间上非常接近。直接用这种连续样本做训练，神经网络很容易陷入**局部最小**或**过拟合**到近期经验，导致训练不稳定、震荡甚至发散。

把历史经验 `(s, a, r, s')` 都存在一个缓冲区里。训练时随机采样一小批（mini-batch） 经验。这种随机采样打乱了样本的时间顺序，使得用于更新的数据近似于独立同分布，大大提升了训练的稳定性。

------



## [RLHF](https://huggingface.co/blog/rlhf)

1. **监督微调**：收集高质量数据，微调预训练模型得到初始策略 $\pi_{\text{SFT}}$。
2. **奖励建模**：收集人类对模型多个回答的偏好数据 $(x, y_w, y_l)$（$y_w$ 为优选回答，$y_l$ 为劣选回答），训练一个奖励模型 $r_\phi(x, y)$ 来拟合人类偏好。
3. **策略优化**：使用 PPO 等算法，基于奖励模型 $r_\phi$ 优化策略 $\pi_\theta$，最大化奖励的同时约束策略不要偏离 $\pi_{\text{SFT}}$ 太远（通过 KL 惩罚项）。



## PG for LLM

> - 智能体：语言大模型，根据输入的提示词逐个自回归生成 token
> - 环境：奖励设计
> - 状态：自回归过程中某一个时刻输入的文本序列
> - 动作：自回归过程中某一个时刻输出的 token 概率分布及其采样
> - 即时奖励：对当前文本序列下输出的 token 反馈优劣，实际只有最后一个 token 能得到即时奖励，其余为0

### 4 MODEL

- Reward：输入为`prompt+completion`，输出为`completion`的不同长度状态下的奖励值
  - 基于规则
  - 基于其他语言大模型 SFT
  - `AutoModelForCausalLMWithRewardHead`
- Policy（Actor）：输入为`prompt`，输出为`prompt+completion`
  - LLM 本身
- Critic：输入为`prompt+completion`，输出为`completion`的不同长度状态下的价值估计
  - 基于其他语言大模型 SFT
  - `AutoModelForCausalLMWithValueHead`
- Ref：策略模型的阶段快照，训练过程中的老策略，参考 [RL Details 1](# RL Details)，保持KL散度较小

### Process

> 以 PPO 为例

1. `Rollout`：根据输入的`prompt`，利用Ref模型生成`response`，形成`prompt-resposne` 对；
1. `Evaluation`：评估`prompt-resposne`，利用Reward模型给出对应sequence的即时奖励；
1. `Optimization`：根据`prompt-resposne`及奖励，组成**经验数据**，再**优化模型**。

```python
from tqdm import tqdm

for epoch in tqdm(range(NUM_EPOCH), "epoch: "):
    if epoch >= config.total_ppo_epochs:
        break

    for batch in tqdm(ppo_trainer.dataloader):
        # Rollout: generate prompt_response pairs
        question_tensors = batch["input_ids"]
        response_tensors = ppo_trainer.generate(
            question_tensors,
            return_prompt=False,
            length_sampler=output_length_sampler,
            **generation_kwargs,
        )
        batch["response"] = tokenizer.batch_decode(
            response_tensors, skip_special_tokens=True
        )

        # Evaluation: compute rewards with reward model(using sentiment analysis pipline)
        texts = [
            "Question: " + q + "\n\nAnswer: " + r
            for q, r in zip(batch["query"], batch["response"])
        ]
        pipe_outputs = sentiment_pipe(texts, **sent_kwargs)
        socres = [torch.tensor(output[0]["score"]) for output in pipe_outputs]

        # Optimization: run PPO step(s, t, r)
        stats = ppo_trainer.step(question_tensors, response_tensors, socres)
        ppo_trainer.log_stats(stats, batch, socres)

```

$$
\text{rewards} = \text{scores} - \beta \cdot \ell_{\text{KL}}
$$

```python
def compute_rewards(self, scores, logprobs, ref_logprobs, masks):
    rewards, non_score_rewards, kls = [], [], []
    for score, logprob, ref_logprob, mask in zip(scores, logprobs, ref_logprobs, masks):
        # Compute KL divergence
        kl = self._kl_penalty(logprob, ref_logprob)
        kls.append(kl)

        # Compute non-score reward
        non_score_reward = -self.kl_ctl.value * kl
        non_score_rewards.append(non_score_reward)

        # Compute total reward
        reward = non_score_reward.clone()
        last_non_masked_index = mask.nonzero()[-1]
        reward[last_non_masked_index] += score
        rewards.append(reward)
```

$$
\text{advantage'}_t = \text{rewards}_t + \gamma \cdot \text{value}_{t+1} - \text{value}_{t} \\
\text{advantage}_t = \text{advantage'}_t + \gamma \cdot \lambda \cdot  \text{advantage'}_{t+1}
$$

```python
def compute_advantages(self, values, rewards, mask):
    lastgaelam = 0
    advantages_reversed = []
    gen_len = rewards.shape[-1]

    values = values * mask
    rewards = rewards * mask
    if self.config.whiten_rewards:
        rewards = masked_whiten(rewards, mask, shift_mean=True)

    for t in reversed(range(gen_len)):
        nextvalues = values[:, t + 1] if t < gen_len - 1 else 0.0
        delta = rewards[:, t] + self.config.gamma * nextvalues - values[:, t]
        lastgaelam = delta + self.config.gamma * self.config.lamda * lastgaelam
        advantages_reversed.append(lastgaelam)
    advantages = torch.stack(advantages_reversed[::-1]).transpose(0, 1)

    returns = advantages + values
    if self.config.whiten_advantages:
        advantages = masked_whiten(advantages, mask)
    advantages = advantages.detach()
    return values, advantages, returns
```

$$
\ell_{\text{vf}} = \mathbb{E}_t\left[ \max\left( 
\left(V_\theta(s_t) - \hat{R}_t\right)^2, 
\left(V_{\text{clip}}(s_t) - \hat{R}_t\right)^2 
\right) \right] \quad s.t.
V_{\text{clip}}(s_t) = \text{clip}\left(V_\theta(s_t),\ 
V_{\theta_{\text{old}}}(s_t) - \epsilon,\ 
V_{\theta_{\text{old}}}(s_t) + \epsilon\right)
$$

$$
\ell_{\text{pg}} = -\mathbb{E}_t\left[ \min\left( 
r_t(\theta) \hat{A}_t,\ 
\text{clip}\big(r_t(\theta), 1-\epsilon, 1+\epsilon\big) \hat{A}_t 
\right) \right] \quad s.t. r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{\text{old}}}(a_t|s_t)}
$$

$$
\ell_{\text{total}} = \ell_{\text{pg}} + c_1 \cdot \ell_{\text{vf}} - c_2 \cdot \mathbb{E}_t\left[ H(\pi_\theta(\cdot|s_t)) \right] \quad \\

c_1：价值函数系数（\texttt{vf\_coef}），通常 c_1 \in [0.5, 1.0] \\
c_2：熵系数（\texttt{ent\_coef}），通常 c_2 \in [0.01, 0.05] \\
H：策略熵，H(\pi_\theta(\cdot|s_t)) = -\sum_a \pi_\theta(a|s_t) \log \pi_\theta(a|s_t)，用于鼓励探索 \\
$$

```python
def loss(
    self, old_logprobs, values, logits, vpreds, logprobs, mask, advantanges, returns
):
    vpredclipped = clip_by_value(
        vpreds,
        values - self.config.cliprange_value,
        values + self.config.cliprange_value,
    )

    vf_losses1 = (vpreds - returns) ** 2
    vf_losses2 = (vpredclipped - returns) ** 2
    vf_loss = 0.5 * masked_mean(torch.max(vf_losses1, vf_losses2), mask)
    vf_clipfrac = masked_mean(torch.gt(vf_losses2, vf_losses1).float(), mask)

    ratio = torch.exp(logprobs - old_logprobs)
    pg_losses1 = -advantanges * ratio
    pg_losses2 = -advantanges * torch.clamp(
        ratio, 1.0 - self.config.cliprange, 1.0 + self.config.cliprange
    )
    pg_loss = masked_mean(torch.max(pg_losses1, pg_losses2), mask)
    pg_clipfrac = masked_mean(torch.gt(pg_losses2, pg_losses1).float(), mask)

    loss = pg_loss + self.config.vf_coef * vf_loss
```






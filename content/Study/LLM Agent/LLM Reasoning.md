---
date: 2025-04-24 16:31
reference: https://llmagents-learning.org/f24
---

## 개요

우리는 인공지능이 소량의 예시만으로도 사람처럼 학습하기를 기대하지만, 현재 대부분의 머신러닝 모델은 여전히 대량의 데이터에 의존한다. 이 차이의 핵심에는 '추론(Reasoning)' 능력이 있다. 이 문서에서는 거대 언어 모델(LLM)의 추론 능력을 높이는 주요 기법들과 아직 남아 있는 한계점들을 간략히 정리한다.

## LLM 추론의 핵심 아이디어

다양한 연구에서, LLM이 스스로 추론 과정을 따르도록 유도하는 프롬프팅(prompting) 전략이 모델 성능을 크게 향상시킨다는 사실을 보여주었다.

### Intermediate Steps (중간 추론 단계)

문제를 단번에 해결하도록 학습할 때보다, 중간 단계를 명시해 주는 방식이 훨씬 효율적이다. 실제로 단 하나의 예시만으로도 해결 과정을 프롬프트에 담으면 성능이 크게 올라가며, 이는 LLM에게 '중간 추론 단계'가 필수적임을 시사한다.

###### References
* **Ling et al, 2017**[^1]
    * 중간 추론 단계(natural language rationale)를 사용하여 수학 문제를 해결하는 방법을 개척한 연구로 소개됨. 작은 단계를 통해 최종 답변을 도출하는 방식의 중요성을 강조함.
* **Cobbe et al, 2021**[^2]
    * Ling et al.의 연구를 이어받아 자연어 추론을 포함하는 대규모 수학 문제 데이터셋(GSM8K)을 구축하고, 이를 사용하여 GPT3를 파인튜닝했음. 중간 단계로 파인튜닝하는 것의 중요성을 보여줌.
* **Nye et al, 2021**[^3]
    * LLM이 중간 계산을 위해 "스크래치패드"를 사용하는 연구로 언급됨. 중간 단계로 파인튜닝하거나 프롬프트하는 방법의 예시로 제시됨.
* **Wei et al, 2022**[^4]
    * Chain-of-Thought (CoT) 프롬프팅 개념을 도입한 논문으로, 프롬프트에 중간 단계를 포함시켜 LLM의 추론 능력을 유도하는 핵심적인 방법으로 소개됨.

### Least-to-Most Prompting (점진적 문제 해결)

복잡한 문제를 작은 하위 문제로 나누어 순차적으로 풀도록 유도하는 전략이다. 전체 문제를 한 번에 풀 때보다, 아주 적은 예시(예: 전체의 0.1%)만으로도 더 높은 성능을 얻을 수 있다. 이는 얕은 깊이(constant-depth) 모델로도 충분히 문제를 해결할 수 있음을 보여 준다.

###### References
* **Zhou et al, 2023**[^5]
    * 복잡한 문제를 하위 문제로 분해하여 점진적으로 해결하는 Least-to-Most 프롬프팅 전략을 제시함. 이 방식을 통해 매우 적은 양의 예시만으로도 우수한 일반화 성능을 달성할 수 있음을 보여줌.
* **Drozdov et al, 2023**[^6]
    * Text-to-Code 작업에서 합성적 일반화(compositional generalization)에 관한 연구. 적은 데이터로도 좋은 성능을 얻을 수 있음을 보여줌.
* **Li et al, 2024**[^7]
    * intermediate steps가 유용한 이유에 대한 이론적 설명을 제공. 충분히 긴 중간 추론 단계를 생성하면 트랜스포머가 연속된 문제를 해결할 수 있음을 이론적으로 보임.

### Zero-shot Chain-of-Thought

Few-shot 예시 없이 "Let's think step by step"과 같은 간단한 문구만으로 LLM이 스스로 추론 과정을 생성하도록 유도하는 방법이다. 예시 없이도 추론을 활성화할 수 있지만, 성능은 Few-shot CoT보다 다소 낮다.

###### References
* **Kojima et al, 2022**[^8]
    * "Let's think step by step"과 같은 간단한 지시어로 예시 없이도 단계별 추론을 유도하는 Zero-shot reasoner 연구를 제시. 하지만 일반적으로 Few-shot 방식보다 성능이 떨어진다고 언급됨.

### Analogical Reasoning (유추 기반 추론)

직접적인 예시 대신, 모델이 스스로 연관된 사례나 지식을 생성하고 이를 바탕으로 문제를 풀게 하는 방식이다. Zero-shot 환경에서도 준수한 결과를 내며, LLM이 내장된 지식을 활용해 추론할 수 있음을 보여 준다.

###### References
* **Yasunaga et al, 2024**[^9]
    * LLM을 유추적 추론자(Analogical Reasoner)로 활용하는 연구. 고정된 예시 대신 관련 예제나 지식을 스스로 생성하고 이를 바탕으로 추론함으로써 적응적으로 추론할 수 있음을 제안함.

### Non-greedy Decoding을 활용한 Zero-shot CoT

기존의 탐욕적(greedy) 디코딩 방식은 추론 과정에서 한 번 잘못된 길로 들어서면 계속 잘못된 결과를 생성할 수 있다. 이를 개선하기 위해 여러 상위 후보(N-best)를 고려해 다양한 추론 경로를 샘플링하고, 최종적으로 전체 확률이 가장 높은 답변을 선택하는 전략이 제안되었다. 이 방법은 순수 탐욕적 디코딩보다 우수한 성능을 보인다.

###### References
* **Wang and Zhou, 2024**[^10]
    * 명시적인 프롬프트 없이도 Chain-of-Thought 추론을 이끌어내는 연구. 비-탐욕적 디코딩 전략을 통해 사전 훈련된 LLM의 단계별 추론 잠재력을 끌어낼 수 있으며, 추론 경로가 존재할 때 최종 답변에 대한 모델의 확신이 더 높아진다고 설명함.

### Self-consistency (자기 일관성)

LLM의 추론 기반 답변 생성 과정은 우리가 궁극적으로 원하는 목표와 일치하지 않는다.

$$
  \arg\max P(r,a\mid p)\neq \arg\max P(a\mid p),
$$
where $r$ is the `reasoning path`, $a$ is the `final answer`, and $p$ is the `problem`.

고로 같은 문제에 대해 여러 경로($r$)를 샘플링한 뒤, 가장 자주 등장하는 답($a$)을 최종으로 선택하면 일관성이 높은 답변이 더 정확하다는 것이 밝혀졌다.

$$
\sum_{r} P(r, a \mid p) = P(a \mid p)
$$

###### References
* **Wang et al, 2023**[^11]
    * 단계별 추론의 성능을 크게 향상시키는 Self-Consistency 기법을 소개. 여러 추론 경로를 샘플링한 후 가장 빈번한 답변을 선택하는 방식으로, 일관성이 높은 답변이 더 정확할 가능성이 높음을 보여줌.
* **Chen et al, 2023**[^12]
    * 자유 형식 답변 생성을 위한 Universal Self-Consistency (USC)를 제안. LLM 스스로 여러 생성된 답변 중 가장 일관적인 답변을 선택하도록 하는 방식임.

## LLM 추론의 주요 한계

여러 기법으로 성능을 높일 수 있지만, 여전히 다음과 같은 한계점이 남아 있다.

### Irrelevant Context (관련 없는 정보의 영향)

프롬프트에 문제 해결과 무관한 정보가 섞이면, 모델이 쉽게 혼동되어 성능이 떨어진다. "관련 없는 정보는 무시하라"는 지시를 추가하면 어느 정도 완화되지만, 근본적인 해결책은 아니다.

###### References
* **Shi et al, 2023**[^13]
    * LLM이 관련 없는 정보에 쉽게 방해받아 성능이 저하되는 한계점을 지적한 연구. 관련 없는 정보를 무시하라는 지시가 성능 저하를 일부 완화할 수 있다고 언급함.
* **Marzocchi et al, 2002**[^14]
    * 인간(특히 부주의한 아동 및 성인) 역시 관련 없는 정보에 의해 문제 해결 능력이 저하된다는 심리학 연구로, LLM의 관련 없는 정보 취약성과 유사성을 보인다고 언급됨.

### Self-correction (불안정한 자기 수정)

모델 스스로 생성된 답변을 검토하고 수정하도록 하면, 잘못된 답변을 올바르게 고치지만 동시에 맞았던 답변을 틀리게 수정하는 모습을 보인다. 여러 LLM이 토론하며 답을 개선하는 방식(Multi-LLM Debate)은 이런 문제가 더 심각하다.
다만, 틀린 문제를 잘 수정한다는 점에서 LLM 스스로의 판단보다는 외부의 정확한 피드백(Oracle feedback, 예: Self-debug에서 unit test 사용)의 필요성을 시사한다.

###### References
* **Huang et al, 2024**[^15]
    * LLM이 스스로 추론 오류를 안정적으로 수정하지 못한다는 한계점을 제시. 잘못된 답변을 고치기도 하지만, 올바른 답변을 틀리게 바꾸는 경우도 있음을 보여줌.
* **Chen et al, 2023**[^16]
    * Self-correction의 한계점과 관련하여, Self-debug 방식이 unit test를 외부 피드백(oracle)으로 활용하여 효과적인 자가 수정을 가능하게 하는 예시로 제시됨.

### Premise Order (전제 순서에 민감)

논리적으로 동일한 의미의 질문이라도, 문제 내 정보(전제)들의 제시 순서 변경시 모델의 답변이 크게 달라지는 현상이 관찰된다. 이는 LLM이 정보의 의미론적 동등성을 완전히 이해하기보다, 제시된 순서나 표면적 형식에 의존하여 추론하는 경향이 있음을 보여 준다.

###### References
* **Chen et al, 2024**[^17]
    * 문제나 논리적 전제의 순서가 LLM의 추론 성능에 큰 영향을 미친다는 연구. 이는 LLM이 정보의 의미보다는 제시된 순서에 민감하게 반응할 수 있음을 시사하는 한계점임.

[^1]: [Ling et al. (2017). Program Induction by Rationale Generation: Learning to Solve and Explain Algebraic Word Problems. ACL 2017.](https://aclanthology.org/P17-1015/)
[^2]: [Cobbe et al. (2021). Training Verifiers to Solve Math Word Problems. arXiv:2110.14168 [cs.LG].](http://arxiv.org/pdf/2110.14168)
[^3]: [Nye et al. (2021). Show Your Work: Scratchpads for Intermediate Computation with Language Models. arXiv:2112.00114 [cs.LG].](https://research.google/pubs/show-your-work-scratchpads-for-intermediate-computation-with-language-models/)
[^4]: [Wei et al. (2022). Chain-of-thought prompting elicits reasoning in large language models. NeurIPS 2022.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference.html)
[^5]: [Zhou et al. (2023). Least-to-Most Prompting Enables Complex Reasoning in Large Language Models. ICLR 2023.](https://webdocs.cs.ualberta.ca/~dale/papers/iclr23a.pdf)
[^6]: [Drozdov et al. (2023). Compositional Semantic Parsing with Large Language Models. ICLR 2023.](https://openreview.net/forum?id=gJW8hSGBys8)
[^7]: [Li et al. (2024). Chain of Thought Empowers Transformers to Solve Inherently Serial Problems. ICLR 2024.](https://arxiv.org/abs/2402.12875)
[^8]: [Kojima et al. (2022). Large language models are zero-shot reasoners. NeurIPS 2022.](https://proceedings.neurips.cc/paper_files/paper/2022/hash/8bb0d291acd4acf06ef1120994611156-Abstract-Conference.html)
[^9]: [Yasunaga et al. (2024). Large Language Models as Analogical Reasoners. ICLR 2024.](https://arxiv.org/pdf/2310.01714)
[^10]: [Wang and Zhou. (2024). Chain-of-Thought Reasoning Without Prompting. arXiv preprint arXiv:2402.10200.](https://arxiv.org/abs/2402.10200)
[^11]: [Wang et al. (2023). Self-Consistency Improves Chain of Thought Reasoning in Language Models. ICLR 2023.](https://openreview.net/pdf/9d06013867701125040af03996c3aefddc8d58d1.pdf)
[^12]: [Chen et al. (2023). Universal Self-Consistency for Large Language Model Generation. arXiv:2311.17311 [cs.CL].](https://arxiv.org/abs/2311.17311)
[^13]: [Shi et al. (2023). Large Language Models Can Be Easily Distracted by Irrelevant Context. ICML 2023.](https://proceedings.mlr.press/v202/shi23a.html)
[^14]: [Marzocchi et al. (2002). The disturbing effect of irrelevant information on arithmetic problem solving in inattentive children. Developmental neuropsychology, 21(1), pp.73-92.](https://pubmed.ncbi.nlm.nih.gov/12058836/)
[^15]: [Huang et al. (2024). Large Language Models Cannot Self-Correct Reasoning Yet. ICLR 2024.](https://openreview.net/forum?id=IkmD3fKBPQ)
[^16]: [Chen et al. (2023). Teaching Large Language Models to Self-Debug. arXiv:2302.00093 [cs.CL], ICLR 2024.](https://arxiv.org/pdf/2304.05128) ([OpenReview Link](https://openreview.net/forum?id=KuPixIqPiq))
[^17]: [Chen et al. (2024). Premise Order Matters in Reasoning with Large Language Models. ICML 2024.](https://arxiv.org/abs/2402.08939) ([OpenReview Link](https://openreview.net/forum?id=uLzHdzadnI))

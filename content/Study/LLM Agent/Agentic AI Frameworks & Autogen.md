---
date: 2025-06-20
reference: https://llmagents-learning.org/f24
---

## 개요

이 문서는 Agentic AI Framework의 핵심 개념과 마이크로소프트에서 개발한 AutoGen 프레임워크를 중심으로 주요 특징과 유스케이스를 정리한다.

## Agentic AI Framework

### Agentic AI의 Key Benefit

* **Useful Interface**: 복잡한 작업을 자연어를 통해 직관적으로 지시할 수 있다.
* **Strong Capability**: 모델 성능이 크게 향상되어, 사람의 직접 개입 없이도 고난도 작업을 수행할 수 있다.
* **Useful Architecture**: 기존과 완전히 다른 업무 방식으로 전환할 수 있다. 예를 들어 전통적으로 사람이 하드코딩하던 코드를 이제는 대화를 통해 생성·수정할 수 있다.

### Agentic Program 구조

* 사용자는 백엔드에서 어떤 Agent들이 어떤 작업을 수행하는지 알지 못하며, 오직 Commander와 자연어 대화만 주고받는다.
* 백엔드에서는 Code Writer, Safeguard 등 여러 Agent가 반복적인 피드백 루프를 돌며 협업한다.
* 코드 생성 → 오류 탐지 → 수정 제안 → 재검증 과정을 자동 순환하면서 결과를 지속적으로 개선한다.

### Multi-Agent Workflow의 장점

* **더 복잡한 문제 해결**: 복잡한 문제를 여러 작은 태스크로 분할해 각 Agent가 병렬로 해결한다. Model capacity가 낮고 task complexity가 높을수록 Multi-Agent의 필요성이 증가한다.
* **Modular Design**: 모듈 단위로 언어, 도구, 모델끼리 교체·확장할 수 있어 다양한 도메인과 요구사항에 빠르게 대응한다.

### 좋은 Agentic AI Framework의 핵심 요소

* **직관적인 통합 에이전트 추상화 (Intuitive unified agentic abstraction)**
    * 인간, 도구, 여러 언어 모델 등 서로 다른 유형의 엔티티를 하나의 개념으로 묶어 복잡한 시스템을 쉽게 추론·구축할 수 있도록 한다.
    * 다양한 역할의 인간, 여러 공급자의 모델, 각종 도구를 단일 추상화 계층으로 통합한다.
* **유연한 멀티 에이전트 오케스트레이션 (Flexible multi-agent orchestration)**
    * 정적(고정된 단계)·동적(에이전트 자율성) 워크플로우를 모두 지원한다.
    * 자연어(NL) 또는 프로그래밍 언어(PL)를 통한 제어를 허용해 유연성과 통제력을 함께 확보한다.
    * 컨텍스트 공유/격리, 협력/경쟁, 중앙집중/분산, 인간 개입/완전 자동화 등 다양한 상호작용 패턴을 폭넓게 지원한다.
* **에이전트 디자인 패턴의 효과적인 구현 (Effective implementation of agentic design patterns)**
    * **대화 (Conversation)**: 다중 에이전트 대화를 핵심 메커니즘으로 삼아 유연한 상호작용을 지원한다.
    * **프롬프팅·추론 (Prompting & Reasoning)**: ReAct, Reflection, Chain/Tree of Thoughts 등 다양한 추론 기법을 아우른다.
    * **도구 사용 (Tool use)**: 외부 툴을 효과적으로 호출·활용할 수 있어야 한다.
    * **계획 (Planning)**: 복잡한 작업을 위한 단계적·계층적 계획 수립 기능을 제공한다.
    * **다중 모델·양식·메모리 통합**: 텍스트·이미지 등 다양한 데이터 양식과 메모리 메커니즘, 여러 AI 모델을 결합할 수 있어야 한다.

이러한 요건을 충족하는 프레임워크는 개발자가 복잡하고 새로운 Agentic AI 애플리케이션을 더욱 빠르고 창의적으로 실험·구축하도록 돕는다. Chi Wang은 AutoGen이 이러한 요구를 만족하도록 설계되었으며, 특히 다중 에이전트 대화 프로그래밍을 핵심으로 삼고 있다고 강조한다.

## AutoGen

### AutoGen 개요 ─ 좋은 Agentic AI Framework 요건 충족 방식

AutoGen은 **대화형 에이전트(conversational agent)**와 **대화형 프로그래밍(conversational programming)**을 핵심 축으로 하며, 이를 기반으로 Nested Agent, Group Agent, Tool-using 등 다양한 에이전트 패턴을 손쉽게 설계·운영할 수 있다.

또한, Autogen은 좋은 Agentic AI Framework의 핵심 요소를 다음과 같이 충족한다.

1.  **직관적인 통합 에이전트 추상화 (Intuitive unified agentic abstraction)**
    * **Conversable Agent**: 언어 모델·도구·인간 입력을 백엔드로 사용할 수 있는 범용 에이전트.
    * **통합 및 재사용**: 인간·다양한 LLM·도구를 하나의 개념으로 다뤄 복잡한 시스템 추론·구축 용이.
    * **재귀적 구성**: 에이전트 내부에 다른 에이전트를 중첩해 더 복잡한 에이전트를 재귀적으로 설계.
2.  **유연한 멀티 에이전트 오케스트레이션 (Flexible multi-agent orchestration)**
    * **대화 프로그래밍**: "에이전트 정의 → 대화 시작" 두 단계로 복잡한 워크플로우 구축.
    * **다양한 대화 패턴**: Sequential·Nested·Group Chat 지원, 필요 시 상태 기반(StateFlow) 제약 추가.
    * **유연성과 제어**: 정적/동적, NL/PL 제어, 컨텍스트 공유·격리, 협력·경쟁 등 다양한 상호작용 패턴 설정 가능.
3.  **에이전트 디자인 패턴의 효과적인 구현 (Effective implementation of agentic design patterns)**
    * 대화를 중심 메커니즘으로 자연스러운 모델 상호작용 제공.
    * **프롬프팅 & 추론**: Reflection 등 고급 추론 기법으로 성능 개선.
    * **도구 사용**: 외부 툴을 호출해 행동 제약·검증(예: Conversational Chess).
    * **계획**: Group Chat·StateFlow로 단계적·계층적 계획 수립.
    * 다중 모델·양식·메모리 통합 지원.
4.  **다양한 애플리케이션 요구사항 지원 (Support diverse application needs)**
    * **광범위한 활용**: SW 개발, 연구, 데이터 처리, 게임, 콘텐츠 생성 등.
    * **실제 적용 사례**: MIT SciAgents, Agent-E 등에서 성공적 적용.
    * **확장성·통합성**: OpenAI Assistant, LlamaIndex, LangChain 등과 호환.

### 대표 유스케이스

* **Self-Healing in Conversational Programming**: 오류를 의도적으로 삽입한 뒤에도 다중 에이전트가 분석 → 코드 생성 → 실행 → 오류 탐지·수정 루프를 통해 자가치유(self-healing)가 가능하다는 것을 확인했다.
* **커피숍 공급망 비용 분석**: 예컨대 커피숍 사장이 “특정 공급업체 배송이 금지되면 비용이 어떻게 변할까?”를 묻는 상황을 가정한다. Commander가 질문을 이해하고 Writer에게 파이썬 기반 최적화 코드를 작성하게 한 뒤, Safeguard가 코드의 안전성과 정확성을 검증한다. 검증된 코드를 실행해 시나리오별 총 비용을 계산·시각화하고, 결과를 자연어로 요약해 사용자에게 제공한다.
* **Blogpost**: Writer와 Critic 간 반복 피드백 루프로 초안을 개선하고, Critic 내부에 SEO·법률·윤리 리뷰어를 둔 Nested Chat으로 고급 반성을 수행한다.
* **Conversational Chess**: 두 LLM이 수를 제안하면 Chess Board 툴 에이전트가 python-chess로 합법성을 즉시 검증하고 불법 수는 수정 요청해 정상 게임을 보장한다.
* **Group Chat Planning**: Group Chat Manager가 매 발화 후 컨텍스트를 평가해 다음 발화자를 자동 지정하거나 StateFlow 규칙으로 순서를 고정해 복잡 태스크를 유연·안정적으로 진행한다.
* **그 외 사례**: SciAgents(과학 연구 시뮬), Agent-E(웹 자동화), AutoBuild(적응형 빌드) 등.
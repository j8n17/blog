---
date: 2025-06-21 12:13
reference: https://wikidocs.net/233344
---

## 개요

LangChain Expression Language(LCEL)는 LLM을 활용한 애플리케이션 개발 시, 다양한 구성 요소(Runnable)를 선언적으로 조합하여 복잡한 워크플로우를 손쉽게 구축할 수 있도록 지원하는 핵심 기능이다. 이를 통해 개발자는 각 작업 단위를 직관적인 파이프라인으로 연결하여 비동기, 배치, 스트리밍 등 다양한 실행 환경을 일관된 방식으로 처리할 수 있다.

## LCEL 소개

LCEL의 중심에는 'Runnable'이라는 통일된 인터페이스가 있다. 프롬프트, 모델, 출력 파서 등 모든 구성 요소를 Runnable 객체로 다루고, 이를 | 연산자로 연결하여 순차적인 데이터 흐름을 정의한다. 이는 복잡한 로직을 간결하고 가독성 높은 코드로 표현할 수 있게 한다.

### PromptTemplate (프롬프트 템플릿)

사용자 입력을 받아 동적으로 프롬프트를 생성하는 가장 기본적인 구성 요소이다. 템플릿 문자열 내에 변수를 `{}`로 표기하면, 해당 변수를 입력받아 완성된 프롬프트를 생성한다.

```python
from langchain import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "{country}의 수도는 어디인가요?"
)
prompt = prompt_template.format(country="한국")
print(prompt)
# "한국의 수도는 어디인가요?"
```

### OutputParser (출력 파서)

LLM의 출력은 일반적으로 `AIMessage` 객체 형태로, 순수 텍스트 외에 다양한 메타데이터를 포함한다. `OutputParser`는 이 객체의 정보를 토대로 원하는 형태로 추출하는 역할을 수행하여 후속 처리 과정을 단순화한다.

```python
from langchain.chat_models import ChatOpenAI
model = ChatOpenAI(model_name="gpt-4")
raw_message = model.invoke("한국의 수도는 어디인가요?")
print(raw_message)
# AIMessage(
#   content='서울',
#   response_metadata={...},
#   id='...',
#   usage_metadata={...}
# )

from langchain.output_parsers import StrOutputParser
parser = StrOutputParser()
parsed_output = parser.invoke(raw_message)
print(parsed_output)
# "서울"
```

### Chaining with Pipe Operator (파이프 연산자를 이용한 체인 구성)

LCEL의 가장 큰 특징은 | 연산자를 통해 여러 Runnable 객체를 간단하게 연결할 수 있다는 점이다. `PromptTemplate`, `Model`, `OutputParser`를 순서대로 연결하면, 입력값이 각 단계를 순차적으로 거쳐 최종 결과물만 반환되는 간결한 체인을 완성할 수 있다.

```python
chain = prompt_template | model | parser

# 체인 실행 시, 입력값("한국")이 prompt_template으로 전달되어 전체 프로세스가 시작된다.
response = chain.invoke("한국")
print(response)
# "서울"
```

## LCEL의 핵심 아이디어

LCEL은 단순한 체인 구성을 넘어, 병렬 실행, 비동기 및 스트리밍 처리 등 현대적인 애플리케이션이 요구하는 다양한 기능을 내장하고 있다.

### Runnable Protocol (Runnable 프로토콜)

LCEL의 모든 객체는 `Runnable` 프로토콜을 따른다. 이 프로토콜은 다음과 같은 표준 인터페이스를 제공하여 모든 구성 요소가 일관된 방식으로 동작하도록 보장한다.

  * `invoke` / `ainvoke`: 단일 입력에 대한 동기/비동기 호출을 처리한다.
  * `batch` / `abatch`: 여러 입력을 받아 일괄적으로 처리하여 효율성을 높인다.
  * `stream` / `astream`: LLM이 생성하는 결과를 실시간 스트리밍 형태로 받아볼 수 있게 한다.
  * `astream_log`: 최종 결과뿐만 아니라 각 중간 단계의 결과까지 스트리밍하여 디버깅 및 로깅에 유용하다.

### Composition (조합)

LCEL은 두 가지 주요한 조합 방식을 제공하여 복잡한 워크플로우를 구성할 수 있게 한다.

  * **RunnableSequence**: | 연산자로도 표현되며, 여러 Runnable을 순차적으로 실행하는 체인을 만든다.
  * **RunnableParallel**: 여러 Runnable을 병렬로 실행한 후 그 결과를 모아 다음 단계로 전달한다.


---
date: 2025-06-24
reference: https://python.langchain.com/docs/guides/chat/
---

## 개요
Langchain은 여러 공급사의 모델들(OpenAI, Anthropic 등)의 메시지 형식을 통합하여, **일관된 인터페이스**를 제공합니다. 이를 통해 다양한 모델 간 코드 재사용성을 높이고 유지보수를 쉽게 만듭니다.

## Langchain Message 인터페이스

### 사용 예시
```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

langchain_messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Hello!"),
    AIMessage(content="Hey there! How’s it going? What’s on your mind today?"),
    HumanMessage(content="I’m doing great!")
]

response = chat_model.invoke(langchain_messages)
```

### Message 클래스 상세

각 메시지 클래스는 역할(role)과 용도에 따라 구분되며, 아래와 같이 정의됩니다.

#### 1. SystemMessage 
AI 모델의 행동 방침, 대화의 맥락, 톤 등을 설정합니다. 예를 들어, “당신은 친절한 도우미입니다.”와 같은 지침을 제공합니다.  

#### 2. HumanMessage  
사용자의 입력을 나타냅니다. 일반적으로 텍스트 형태이며, 일부 모델에서는 이미지나 오디오 등 멀티모달 데이터도 지원합니다.  

참고: 문자열 입력은 자동으로 HumanMessage로 변환되어 처리됩니다.

```python
response = chat_model.invoke("안녕하세요?")
```
   
#### 3. AIMessage  
AI 모델의 응답 메시지로, 텍스트뿐 아니라 도구 호출 요청이나 멀티미디어 응답도 포함될 수 있습니다.  
- Standardized 속성: 다양한 모델(OpenAI, Anthopic 등)에서 공통적으로 사용할 수 있도록 표준화한 속성.  
    - `tool_calls`: 도구 호출 정보.  
    - `invalid_tool_calls`: 파싱 오류가 발생한 도구 호출 정보.  
    - `usage_metadata`: 토큰 사용량 등 메타데이터.  
    - `id`: 메시지의 id.  
- Raw 속성: 각 모델에서 제공하는 고유 데이터 등 표준화되지 않은 속성.
    - `content`: (str 또는 리스트) 모델이 생성한 원시 응답 텍스트 혹은 멀티모달 콘텐츠(텍스트, 이미지, 오디오 등).  
    - `response_metadata`: 응답 관련 추가 정보(응답 헤더, logprobs, 토큰 카운트 등).  

#### 4. AIMessageChunk  
AIMessage의 스트리밍 버전으로, 모델이 응답을 생성하는 즉시 부분적으로 반환할 때 사용합니다.  
참고: 여러 개의 AIMessageChunk를 `+` 연산자로 합쳐 하나의 AIMessage로 만들 수 있습니다.  

```python
ai_message = chunk1 + chunk2 + chunk3
```

#### 5. ToolMessage  
외부 도구 호출 결과를 모델에 전달할 때 사용합니다.  
- 주요 속성:  
    - `tool_call_id`: 호출된 외부 도구나 함수의 id.  
    - `artifact`: 도구 실행 결과물(추적용, 모델에 전달 X).  

#### 6. RemoveMessage  
LangGraph에서 대화 기록을 관리(삭제)할 때 사용하는 특수 메시지입니다.  

#### 7. (Legacy) FunctionMessage  
OpenAI의 예전 function-calling API에 대응하는 메시지이며, 현재는 ToolMessage 사용이 권장됩니다.

## OpenAI의 Chat Completions API 형식

OpenAI의 Chat Completions API 형식으로 프롬프트가 작성된 경우, LangChain은 각 role에 따른 Langchain의 메시지 형식으로 변환해서 처리합니다.

### role에 따른 Message 클래스

| OpenAI role | LangChain Message 클래스 |
| ----------- | ------------------------ |
| `system`    | `SystemMessage`          |
| `user`      | `HumanMessage`           |
| `assistant` | `AIMessage` or `AIMessageChunk` |
| `tool`      | `ToolMessage`            |

### 사용 예시
```python
openai_messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
]

response = chat_model.invoke(openai_messages)
```

## 메시지 형식 변환
각각의 형식으로 변환이 필요할 땐 다음 함수를 사용합니다.

```python
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.messages.utils import convert_to_messages
from langchain_core.messages import convert_to_openai_messages

messages = [
    SystemMessage(content='You are a helpful assistant.'),
    HumanMessage(content='안녕하세요! 오늘 날씨가 어떨까요?'),
    {"role": "assistant", "content": "안녕하세요! 어느 지역의 날씨를 알고 싶으신가요?"},
    {"role": "user", "content": "서울의 날씨를 알려주세요."}
]

lc_messages = convert_to_messages(messages)  # LangChain 메시지 객체 리스트
oai_messages = convert_to_openai_messages(messages)  # OpenAI ChatCompletion API 형식
```

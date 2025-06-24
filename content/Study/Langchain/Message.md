---
date: 2025-06-24
reference: https://python.langchain.com/docs/guides/chat/
---

## 개요
Langchain은 여러 챗 모델(OpenAI, Anthropic 등)의 메시지 형식을 통합하여, **일관된 인터페이스**를 제공합니다. 이를 통해 다양한 모델 간 코드 재사용성을 높이고 유지보수를 쉽게 만듭니다.

## 메시지 형식 및 사용 예시

### OpenAI 메시지 형식
```python
openai_messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
]
```

### Langchain 메시지 형식
```python
from langchain_core.messages import SystemMessage, HumanMessage

langchain_messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Hello!"),
]

response = chat_model.invoke(langchain_messages)
```

> LangChain은 내부적으로 Langchain의 메시지 형식으로 변환하기 때문에 OpenAI 형식의 메시지도 처리할 수 있습니다.

```python
response = chat_model.invoke(openai_messages)
```

## 메시지 역할(role)에 따른 클래스

| OpenAI role | LangChain Message 클래스 |
| ----------- | ------------------------ |
| `system`    | `SystemMessage`          |
| `user`      | `HumanMessage`           |
| `assistant` | `AIMessage`              |
| `tool`      | `ToolMessage`            |

## 참고 사항
* 문자열 입력은 자동으로 `HumanMessage`로 변환됩니다
    ```python
    response = chat_model.invoke("안녕하세요?")
    ```
* 각각의 형식으로 변환이 필요할 땐 다음 함수를 사용합니다
    ```python
    from langchain_core.messages.utils import convert_to_messages
    from langchain_core.messages import convert_to_openai_messages

    lc_messages = convert_to_messages(openai_messages) # Langchain 메시지 형식으로 변환
    oai_messages = convert_to_openai_messages(lc_messages) # OpenAI 형식으로 변환
    ```

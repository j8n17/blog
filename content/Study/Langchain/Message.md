---
date: 2025-06-24
reference: https://python.langchain.com/docs/guides/chat/
---

## 개요

LangChain은 다양한 챗 모델(OpenAI, Anthropic 등)의 **메시지 포맷 차이를 추상화**하여, 개발자가 일관된 `Message` 인터페이스만으로 프롬프트를 구성할 수 있도록 돕는다.  
이를 통해 코드 재사용성 및 유지보수성이 높아지고, 여러 모델을 교차 사용하더라도 동일한 로직을 그대로 적용할 수 있다.

## 메세지 형식 예시

### Chat Completions API[^1]
```python
openai_messages = [
    {"role": "system",    "content": "You are a helpful assistant."},
    {"role": "user",      "content": "Hello, how are you?"},
    {"role": "assistant", "content": "I'm doing well, thank you for asking."},
    {"role": "user",      "content": "Can you tell me a joke?"}
]
```

### LangChain의 `Message` 사용 예시

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

lc_messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Hello, how are you?"),
    AIMessage(content="I'm doing well, thank you for asking."),
    HumanMessage(content="Can you tell me a joke?")
]
```

## Message 자동 변환

OpenAI 형식을 그대로 `ChatModel.invoke()`에 넘겨도 내부적으로 각 메시지의 role에 해당하는 `Message` 객체로 변환되어 사용된다.

```python
response = chat_model.invoke(openai_messages)
```

### 각 role에 대한 Message 클래스

| OpenAI role | LangChain Message 클래스 |
| ----------- | --------------------- |
| `system`    | `SystemMessage`       |
| `user`      | `HumanMessage`        |
| `assistant` | `AIMessage`           |
| `tool`      | `ToolMessage`         |

## 참고 사항

* **문자열 입력**은 role 지정이 없어도 자동으로 `HumanMessage`로 인식된다.
    ```python
    response = chat_model.invoke("Hello, how are you?")
    ```
* 필요하다면 직접 Message 객체를 사용하는 형식으로 바꿀 수 있다.[^2]
    ```python
    from langchain_core.messages.utils import convert_to_messages

    openai_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "안녕, 오늘 날씨 어때?"},
    ]
    lc_messages = convert_to_messages(openai_messages)
    # -> [SystemMessage(content="You are a helpful assistant."), HumanMessage(content="안녕, 오늘 날씨 어때?")]
    ```
* 반대로, `convert_to_openai_messages()`로 **다시 OpenAI 포맷**으로 변환할 수 있다.[^3]
    ```python
        from langchain_core.messages import (
            convert_to_openai_messages,
            AIMessage,
            SystemMessage,
            ToolMessage,
        )

        messages = [
            SystemMessage([{"type": "text", "text": "foo"}]),
            {"role": "user", "content": [{"type": "text", "text": "whats in this"}, {"type": "image_url", "image_url": {"url": "data:image/png;base64,'/9j/4AAQSk'"}}]},
            AIMessage("", tool_calls=[{"name": "analyze", "args": {"baz": "buz"}, "id": "1", "type": "tool_call"}]),
            ToolMessage("foobar", tool_call_id="1", name="bar"),
            {"role": "assistant", "content": "thats nice"},
        ]
        oai_messages = convert_to_openai_messages(messages)
        # -> [
        #   {'role': 'system', 'content': 'foo'},
        #   {'role': 'user', 'content': [{'type': 'text', 'text': 'whats in this'}, {'type': 'image_url', 'image_url': {'url': "data:image/png;base64,'/9j/4AAQSk'"}}]},
        #   {'role': 'assistant', 'tool_calls': [{'type': 'function', 'id': '1','function': {'name': 'analyze', 'arguments': '{"baz": "buz"}'}}], 'content': ''},
        #   {'role': 'tool', 'name': 'bar', 'content': 'foobar'},
        #   {'role': 'assistant', 'content': 'thats nice'}
        # ]
    ```

[^1]: OpenAI의 메시지 형식 중 하나
[^2]: [onvert_to_messages docs 링크](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.convert_to_messages.html)
[^3]: [convert-to-openai-messages docs 링크](https://python.langchain.com/api_reference/core/messages/langchain_core.messages.utils.convert_to_openai_messages.html)

---
date: 2025-06-23 10:54
reference: https://wikidocs.net/233341
---

## 개요

이 문서는 LangChain의 기초적인 개념들을 정리한 학습 노트이다. 환경 설정부터 기초적인 API 사용법, 스트리밍, 멀티모달 입력, 그리고 Open AI의 프롬프트 캐싱 전략까지 다룬다.

## 환경 설정

애플리케이션 개발에 앞서 API 키를 안전하게 관리하고, LLM의 동작을 추적하기 위한 LangSmith 설정이 필요하다.

### API Key 관리

API 키는 하드코딩을 피하고 `.env` 파일을 통해 환경 변수로 관리하는 것이 안전하다.

  - **.env 파일**
    ```
    OPENAI_API_KEY=your_openai_api_key
    ```
  - **로드 및 사용 예시**
    ```python
    from dotenv import load_dotenv
    import os

    load_dotenv()  # .env 파일 로드
    api_key = os.environ['OPENAI_API_KEY']
    ```

### LangSmith 설정

LangSmith는 LLM 애플리케이션의 동작을 추적하고 디버깅하기 위한 플랫폼이다. RAG 알고리즘이나 프롬프트 변경 시 성능을 판단하는 데 유용하다.

  - **주요 항목**
      - Retriever가 수집한 문서 결과
      - GPT 모델의 입·출력 기록
      - 프롬프트 변경 이력
      - 토큰 사용량, 응답 지연 시간(latency) 등 메타데이터
  - **.env 파일 추가 항목**
    ```
    LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
    LANGCHAIN_API_KEY=<Langsmith API Key>
    LANGCHAIN_TRACING=<true or false> # 추적 활성화 여부
    LANGCHAIN_PROJECT=<프로젝트명>
    ```

## OpenAI Chat API 사용법

LangChain은 OpenAI의 API를 효율적으로 사용할 수 있는 인터페이스를 제공한다.

### ChatOpenAI 클래스의 주요 파라미터

  - **`temperature`**: (0\~2) 값이 높을수록 답변의 다양성과 창의성이 증가한다.
  - **`model_name`**: 사용할 모델의 이름을 지정한다. (예: `gpt-4.1-nano`)
  - **`max_tokens`**: 생성될 답변의 최대 토큰 수를 제한한다.

### 반환 객체 (`AIMessage`)

API 호출 시 반환되는 `AIMessage` 객체는 다음과 같은 주요 정보를 포함한다.

  - **`content`**: 모델이 생성한 실제 응답 텍스트
  - **`response_metadata`, `id`, `usage_metadata`**: 토큰 사용량, 요청 ID 등 호출 관련 메타데이터

### 호출 예시

```python
from langchain_openai import ChatOpenAI

# LLM 객체 생성
llm = ChatOpenAI(
    temperature=0.1,         # 다양성 (0.0 ~ 2.0)
    model_name="gpt-4.1-nano",  # 모델명
)

# 질의 내용
question = "대한민국의 수도는 어디인가요?"

# 질의 및 결과 출력
response = llm.invoke(question) # AIMessage 반환
print(f"[답변]: {response.content}")
```

### API 유형 비교 및 권장 사용

| API | 특징 | 사용 목적 |
| :--- | :--- | :--- |
| **Completions API** | 단일 프롬프트에 대해 한 번의 텍스트 완성을 제공. LLM의 가장 기본적인 "문장 완성" 기능. 현재는 Legacy로 취급된다. | 간단한 문장/단락 생성, 레거시 코드 유지 |
| **Chat Completions API** | 시스템, 사용자, 어시스턴트 역할을 구분하는 메시지 스택으로 대화 맥락을 유지한다. 이미지, PDF, 오디오 등 멀티모달 입력을 지원한다. | 챗봇, RAG, 멀티모달 애플리케이션 **(권장)** |
| **Responses API** | 2025년 3월 출시된 Agentic 애플리케이션 전용 API. 컨텍스트 자동 관리 및 툴 호출(tool calling)에 중점을 둔다. 5월부터 MCP 서버, 이미지 생성, 코드 인터프리터 기능이 추가되었다. | 복잡한 워크플로, 외부 툴 연동, 에이전트 기반 시스템 |

## 스트리밍 응답

사용자 경험 향상을 위해, 모델이 생성하는 답변을 토큰 단위로 실시간 전송하는 기능이다.

### 동작 원리

`stream()` 메서드는 내부적으로 `generator`를 반환한다. 이를 통해 생성되는 각 토큰(또는 청크)을 순차적으로 전달받아 실시간으로 처리할 수 있다.

### 호출 예시

```python
from langchain_openai import ChatOpenAI

# LLM 객체 생성
llm = ChatOpenAI(
    temperature=0.1,
    model_name="gpt-4.1-nano",
)

# 스트림 방식으로 질의
answer_stream = llm.stream("대한민국의 아름다운 관광지 10곳과 주소를 알려주세요!")

# 스트리밍 응답을 실시간으로 출력
for token in answer_stream:
    print(token.content, end="", flush=True)
```

## 멀티모달 입력 (Image / PDF / Audio)

Chat Completions API를 통해 텍스트 외에 이미지, PDF, 오디오 등 다양한 형식의 데이터를 입력으로 사용할 수 있다.

### 입력 방식

  - **Base64 인코딩 (이미지, PDF, 오디오)**
      - 오디오 파일은 Base64 방식만 지원된다.
      - 다음과 같은 형식으로 데이터를 전달한다. `mime_type`은 실제 데이터 형식에 맞게 지정해야 한다.
        ```json
        {
          "type": "image",
          "source_type": "base64",
          "mime_type": "image/jpeg",
          "data": "<base64 data string>"
        }
        ```
  - **URL (이미지, PDF)**
      - 이미지나 PDF 파일은 웹 URL을 통해 직접 전달할 수 있다.
        ```json
        {
          "type": "image",
          "source_type": "url",
          "url": "https://..."
        }
        ```

### 호출 예시

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    temperature=0.1,
    model="gpt-4o-mini"
)

image_url = "https://example.com/path/to/your/image.jpg"

messages = [
    {
        "role": "system",
        "content": "You are an assistant that describes images in detail."
    },
    {
        "type": "image",
        "source_type": "url",
        "url": image_url
    },
]

ai_response = llm.invoke(messages)

print("Image Description:")
print(ai_response.text())
```

### 모델별 지원

GPT-4o와 같은 최신 멀티모달 모델은 이미지, PDF, 오디오 입력을 모두 지원하지만, 모델 스펙에 따라 지원 형식이 다를 수 있으므로 공식 문서를 확인하는 것이 필수적이다.

## 프롬프트 캐싱 (Prompt Caching)

반복적인 API 호출에 대한 비용을 절감하고 응답 속도를 개선하기 위한 기능이다.

  - **동작 방식**:
      - GPT-4o 이후 모델에서 1024 토큰 이상의 프롬프트에 대해 캐싱이 자동으로 적용된다.
      - 동일한 프롬프트에 대한 API 요청이 들어오면, 이전에 요청을 처리했던 서버로 라우팅된다.
      - **`cache hit`**: 해당 서버의 캐시에 동일한 프롬프트가 존재하면, 새로운 연산을 수행하지 않고 캐시된 결과를 즉시 반환한다.
      - **`cache miss`**: 캐시에 해당 프롬프트가 없으면, 기존 방식대로 API를 호출하고 결과를 반환한 뒤 캐시에 저장한다.
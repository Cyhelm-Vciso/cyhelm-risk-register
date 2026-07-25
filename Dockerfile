FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /app
COPY pyproject.toml README.md ./
COPY src ./src
RUN pip install --no-cache-dir .
USER app
EXPOSE 8000
CMD ["uvicorn", "cyhelm.main:app", "--host", "0.0.0.0", "--port", "8000"]


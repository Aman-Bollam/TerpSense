from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    azure_openai_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-02-01"

    nessie_api_key: str = ""
    nessie_base_url: str = "http://api.nessieisreal.com"

    use_mock_data: bool = True
    demo_user_id: str = "demo"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

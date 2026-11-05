def register_user(client, email: str = "person@example.com") -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Test Person", "email": email, "password": "strong-pass-123"},
    )
    assert response.status_code == 201
    return response.json()


def login_user(client, email: str = "person@example.com") -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "strong-pass-123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_register_login_and_current_user(client) -> None:
    user = register_user(client)
    token = login_user(client)

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["id"] == user["id"]
    assert response.json()["email"] == "person@example.com"


def test_duplicate_email_is_rejected(client) -> None:
    register_user(client)
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Another Person",
            "email": "PERSON@example.com",
            "password": "strong-pass-123",
        },
    )

    assert response.status_code == 409


def test_login_rejects_wrong_password(client) -> None:
    register_user(client)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "person@example.com", "password": "incorrect-pass"},
    )

    assert response.status_code == 401

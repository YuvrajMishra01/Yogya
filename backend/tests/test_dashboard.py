import pytest

@pytest.mark.asyncio
async def test_dashboard_stats(client, officer_token):
    # Create inspection
    await client.post(
        "/api/v1/inspections",
        headers={"Authorization": f"Bearer {officer_token}"},
        data={"productName": "Sample Oil Pack"}
    )

    res = await client.get(
        "/api/v1/dashboard/stats",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert res.status_code == 200
    stats = res.json()
    assert stats["totalInspections"] >= 1
    assert "inconclusiveCount" in stats
    assert "recentInspections" in stats

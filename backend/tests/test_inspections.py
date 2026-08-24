import pytest
import io

@pytest.mark.asyncio
async def test_create_and_get_inspection(client, officer_token):
    # Upload image evidence
    fake_image = io.BytesIO(b"fake label image content")
    response = await client.post(
        "/api/v1/inspections",
        headers={"Authorization": f"Bearer {officer_token}"},
        data={"productName": "Test Parle-G", "manufacturer": "Parle Products"},
        files={"files": ("label.jpg", fake_image, "image/jpeg")}
    )
    assert response.status_code == 201
    report = response.json()
    assert report["productName"] == "Test Parle-G"
    assert report["status"] == "Draft"
    assert len(report["evidenceImages"]) == 1
    assert report["evidenceImages"][0]["name"] == "label.jpg"

    insp_id = report["id"]

    # Fetch report
    get_res = await client.get(
        f"/api/v1/inspections/{insp_id}",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == insp_id

@pytest.mark.asyncio
async def test_rbac_officer_isolation(client, officer_token, officer2_token, admin_token):
    # Officer 1 creates report
    res1 = await client.post(
        "/api/v1/inspections",
        headers={"Authorization": f"Bearer {officer_token}"},
        data={"productName": "Officer 1 Private Product"}
    )
    report1_id = res1.json()["id"]

    # Officer 2 tries to read Officer 1's report -> 403 Forbidden
    res2 = await client.get(
        f"/api/v1/inspections/{report1_id}",
        headers={"Authorization": f"Bearer {officer2_token}"}
    )
    assert res2.status_code == 403

    # Officer 2 tries to patch Officer 1's report -> 403 Forbidden
    res3 = await client.patch(
        f"/api/v1/inspections/{report1_id}",
        headers={"Authorization": f"Bearer {officer2_token}"},
        json={"productName": "Hacked Name"}
    )
    assert res3.status_code == 403

    # Admin can read Officer 1's report -> 200 OK
    res4 = await client.get(
        f"/api/v1/inspections/{report1_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res4.status_code == 200
    assert res4.json()["productName"] == "Officer 1 Private Product"

@pytest.mark.asyncio
async def test_patch_inspection(client, officer_token):
    res = await client.post(
        "/api/v1/inspections",
        headers={"Authorization": f"Bearer {officer_token}"},
        data={"productName": "Draft Cookie"}
    )
    report_id = res.json()["id"]

    patch_res = await client.patch(
        f"/api/v1/inspections/{report_id}",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "productName": "Updated Draft Cookie",
            "mrp": "Rs 50.00",
            "overallStatus": "COMPLIANT",
            "stats": {"totalChecked": 5, "passed": 5, "needsReview": 0, "failed": 0}
        }
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["productName"] == "Updated Draft Cookie"
    assert data["mrp"] == "Rs 50.00"
    assert data["overallStatus"] == "COMPLIANT"
    assert data["stats"]["passed"] == 5

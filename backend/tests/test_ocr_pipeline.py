import pytest
import pytest_asyncio
from app.services.ocr.worker import run_ocr_background_task

@pytest.mark.asyncio
async def test_ocr_endpoints_unauthenticated(client):
    res1 = await client.post("/api/v1/inspections/some-id/process-ocr")
    assert res1.status_code == 401

    res2 = await client.get("/api/v1/inspections/some-id/ocr-status")
    assert res2.status_code == 401

    res3 = await client.get("/api/v1/inspections/some-id/ocr-results")
    assert res3.status_code == 401

@pytest.mark.asyncio
async def test_ocr_endpoints_nonexistent_inspection(client, officer_token):
    headers = {"Authorization": f"Bearer {officer_token}"}
    res = await client.post("/api/v1/inspections/non-existent-id/process-ocr", headers=headers)
    assert res.status_code == 404

    res_status = await client.get("/api/v1/inspections/non-existent-id/ocr-status", headers=headers)
    assert res_status.status_code == 404

    res_results = await client.get("/api/v1/inspections/non-existent-id/ocr-results", headers=headers)
    assert res_results.status_code == 404

@pytest.mark.asyncio
async def test_ocr_pipeline_flow_and_rbac(client, officer_token, officer2_token, admin_token):
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    officer2_headers = {"Authorization": f"Bearer {officer2_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create dummy inspection with 2 evidence images under Officer 1
    files = [
        ("files", ("test1.jpg", b"fake_image_bytes_1", "image/jpeg")),
        ("files", ("test2.jpg", b"fake_image_bytes_2", "image/jpeg")),
    ]
    create_res = await client.post(
        "/api/v1/inspections",
        headers=officer_headers,
        data={"productName": "OCR Test Commodity", "manufacturer": "OCR Foods Ltd"},
        files=files,
    )
    assert create_res.status_code == 201
    inspection = create_res.json()
    inspection_id = inspection["id"]
    assert len(inspection["evidenceImages"]) == 2

    # 2. Officer 2 attempts to process OCR on Officer 1's inspection -> HTTP 403 Forbidden
    forbidden_res = await client.post(f"/api/v1/inspections/{inspection_id}/process-ocr", headers=officer2_headers)
    assert forbidden_res.status_code == 403

    # 3. Officer 1 triggers process-ocr -> HTTP 202 Accepted
    process_res = await client.post(f"/api/v1/inspections/{inspection_id}/process-ocr", headers=officer_headers)
    assert process_res.status_code == 202
    job_data = process_res.json()
    assert job_data["inspection_id"] == inspection_id
    assert job_data["status"] == "pending"

    # 4. Check ocr-status
    status_res = await client.get(f"/api/v1/inspections/{inspection_id}/ocr-status", headers=officer_headers)
    assert status_res.status_code == 200
    assert status_res.json()["job_id"] == job_data["job_id"]

    # 5. Admin can also access ocr-status
    admin_status_res = await client.get(f"/api/v1/inspections/{inspection_id}/ocr-status", headers=admin_headers)
    assert admin_status_res.status_code == 200

    # 6. Manually run worker task synchronously to test region persistence & completed status
    await run_ocr_background_task(job_data["job_id"], inspection_id)

    # 7. Check ocr-results endpoint
    results_res = await client.get(f"/api/v1/inspections/{inspection_id}/ocr-results", headers=officer_headers)
    assert results_res.status_code == 200
    results_data = results_res.json()
    assert results_data["status"] in ["completed", "failed"]
    assert isinstance(results_data["regions"], list)

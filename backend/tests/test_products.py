import pytest

@pytest.mark.asyncio
async def test_products_catalog_derived(client, officer_token):
    # Create two inspections for the same product
    await client.post(
        "/api/v1/inspections",
        headers={"Authorization": f"Bearer {officer_token}"},
        data={"productName": "Amul Butter", "manufacturer": "GCMMF"}
    )
    await client.post(
        "/api/v1/inspections",
        headers={"Authorization": f"Bearer {officer_token}"},
        data={"productName": "Amul Butter", "manufacturer": "GCMMF"}
    )

    # Fetch products catalog
    res = await client.get(
        "/api/v1/products",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert res.status_code == 200
    products = res.json()
    assert len(products) == 1
    amul = products[0]
    assert amul["name"] == "Amul Butter"
    assert amul["stats"]["totalInspections"] == 2
    assert len(amul["inspections"]) == 2

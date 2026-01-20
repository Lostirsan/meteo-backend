async function connectDevice() {
  await fetch('http://localhost:3001/api/device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceName,
      deviceUid,
      plantId
    })
  });

  loadDevice();
}
async function loadDevice() {
  const res = await fetch('http://localhost:3001/api/device');
  device.value = await res.json();
}

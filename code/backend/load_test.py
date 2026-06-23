import time
import requests
import concurrent.futures

URL = "http://127.0.0.1:8001/psychologists?page=1&size=10"
REQUESTS = 100

def fetch():
    start = time.time()
    try:
        res = requests.get(URL)
        end = time.time()
        if res.status_code != 200:
            print("Error code:", res.status_code)
        return end - start
    except Exception as e:
        print("Exception:", e)
        return 0

def run_test():
    print(f"Iniciando prueba de carga: {REQUESTS} peticiones a {URL}...")
    latencies = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(fetch) for _ in range(REQUESTS)]
        for f in concurrent.futures.as_completed(futures):
            val = f.result()
            if val > 0:
                latencies.append(val)

    if not latencies:
        print("Todas fallaron")
        return

    latencies.sort()
    p95_index = int(0.95 * len(latencies))
    p95 = latencies[p95_index] * 1000
    avg = (sum(latencies)/len(latencies)) * 1000
    print(f"P95 Latency: {p95:.2f} ms")
    print(f"Average Latency: {avg:.2f} ms")
    if p95 < 300:
        print("✅ REQUISITO CUMPLIDO: p95 < 300 ms")
    else:
        print("❌ REQUISITO FALLIDO: p95 >= 300 ms")

if __name__ == "__main__":
    run_test()


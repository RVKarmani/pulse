from feldera import FelderaClient, Pipeline
import os
import pandas as pd
from dotenv import load_dotenv
import time
load_dotenv()

# define your callback to run on every chunk of data received
# ensure that it takes two parameters, the chunk (DataFrame) and the sequence number
def callback(df: pd.DataFrame, seq_no: int):
    print(f"\nSeq No: {seq_no}, DF: {df}\n")


feldera_host = os.getenv("FELDERA_HOST")
if not feldera_host:
    raise ValueError("FELDERA_HOST environment variable is not set")

feldera_client = FelderaClient(feldera_host)


feldera_pipeline_name = os.getenv("FELDERA_PIPELINE_NAME")
feldera_pipeline = Pipeline.get(feldera_pipeline_name, feldera_client)

# Continuously fetch and print data
try:
    while True:
        # register the callback for data received from the selected view
        feldera_pipeline.foreach_chunk("source_data", callback)
        time.sleep(1)  # Adjust polling interval as needed
except KeyboardInterrupt:
    print("Stopped listening.")


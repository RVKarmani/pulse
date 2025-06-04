import React, { useEffect, useState, useRef } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Typography, Box, CircularProgress
} from "@mui/material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";

type Sentiment = "NEG" | "POS" | "NEU";

interface SentimentData {
  source_id: string;
  sentiment: Sentiment;
  count: number;
}

type SentimentTableData = Record<
  string, // source_id
  {
    POS?: number;
    NEG?: number;
    NEU?: number;
  }
>;

const sentimentChip = (sentiment: Sentiment, count?: number) => {
  const props = {
    POS: {
      label: count !== undefined ? `POS: ${count}` : "POS: -",
      icon: <SentimentSatisfiedAltIcon />,
      color: "success" as const,
    },
    NEG: {
      label: count !== undefined ? `NEG: ${count}` : "NEG: -",
      icon: <SentimentDissatisfiedIcon />,
      color: "error" as const,
    },
    NEU: {
      label: count !== undefined ? `NEU: ${count}` : "NEU: -",
      icon: <SentimentNeutralIcon />,
      color: "info" as const,
    },
  };
  return (
    <Chip
      icon={props[sentiment].icon}
      label={props[sentiment].label}
      color={props[sentiment].color}
      variant="outlined"
      sx={{ fontWeight: "bold" }}
    />
  );
};

const SentimentStats: React.FC = () => {
  const [tableData, setTableData] = useState<SentimentTableData>({});
  const [loading, setLoading] = useState(true);
  const buffer = useRef(""); // For streaming JSON parsing

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const response = await fetch("http://localhost:3000/api/stats");
      const reader = response.body?.getReader();
      if (!reader) return;
      setLoading(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer.current += new TextDecoder().decode(value);
          let idx;
          while ((idx = buffer.current.indexOf("}\n")) !== -1) {
            const jsonStr = buffer.current.slice(0, idx + 1);
            buffer.current = buffer.current.slice(idx + 2);
            try {
              const parsed = JSON.parse(jsonStr) as SentimentData | SentimentData[];
              const updates = Array.isArray(parsed) ? parsed : [parsed];
              if (isMounted) {
                setTableData(prev => {
                  const newData = { ...prev };
                  for (const rec of updates) {
                    if (!newData[rec.source_id]) {
                      newData[rec.source_id] = {};
                    }
                    newData[rec.source_id][rec.sentiment] = rec.count;
                  }
                  return newData;
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Get all unique source_ids sorted
  const sourceIds = Object.keys(tableData).sort();

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Live Sentiment Counts by Source
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Source</strong></TableCell>
                <TableCell align="center"><strong>POS</strong></TableCell>
                <TableCell align="center"><strong>NEG</strong></TableCell>
                <TableCell align="center"><strong>NEU</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sourceIds.map((source_id) => (
                <TableRow key={source_id}>
                  <TableCell>{source_id}</TableCell>
                  <TableCell align="center">
                    {sentimentChip("POS", tableData[source_id].POS)}
                  </TableCell>
                  <TableCell align="center">
                    {sentimentChip("NEG", tableData[source_id].NEG)}
                  </TableCell>
                  <TableCell align="center">
                    {sentimentChip("NEU", tableData[source_id].NEU)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SentimentStats;

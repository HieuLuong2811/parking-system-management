import { Box, Paper, Tabs, Tab } from "@mui/material";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useUserDetail } from "../api/users";
import { VehiclesPage } from "./vehiclesPage";
import { FormInput } from "../components/common/FormInput";

export const UserProfilePage = () => {
  const { userCode } = useParams();
  const [tab, setTab] = useState(0);

  const { data: user } = useUserDetail(userCode!);

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <Box flex={{ xs: "100%", md: "0 0 320px" }}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormInput
            label="User Code"
            name="user_code"
            value={user?.user_code ?? ""}
            onChange={() => {}}
            disabled
          />

          <FormInput
            label="Full Name"
            name="full_name"
            value={user?.full_name ?? ""}
            onChange={() => {}}
            disabled
          />

          <FormInput
            label="Email"
            name="email"
            value={user?.email ?? ""}
            onChange={() => {}}
            disabled
          />

          <FormInput
            label="Phone Number"
            name="phone_number"
            value={user?.phone_number ?? ""}
            onChange={() => {}}
            disabled
          />
        </Paper>
      </Box>

      <Box flex="1 1 0">
        <Paper>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Vehicles" />
            <Tab label="Subscriptions" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Box>
                <VehiclesPage user_code={userCode} />
              </Box>
            )}

            {tab === 1 && <Box></Box>}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

import { Card, CardContent, Skeleton, Box } from "@mui/material";
import "../../style/page/profil.scss";

const ProfileSkeleton = () => {
  return (
    <div className="profil-page">
      <div className="profil-container">
        <Card className="profil-card">
          <CardContent>
            {/* Header skeleton */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mx: "auto" }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={24}
                sx={{ mx: "auto", mt: 1 }}
              />
            </Box>

            <div className="profil-info">
              {/* Info cards skeleton */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Card variant="outlined">
                  <CardContent>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={20}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={20}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Skeleton variant="text" width="50%" height={24} />
                    <Skeleton
                      variant="text"
                      width="90%"
                      height={20}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={20}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Box>

              {/* Team Pokemon skeleton */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={32}
                    sx={{ mb: 2 }}
                  />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent>
                          <Skeleton
                            variant="rectangular"
                            width={60}
                            height={60}
                            sx={{ mx: "auto", mb: 1 }}
                          />
                          <Skeleton
                            variant="text"
                            width="80%"
                            height={20}
                            sx={{ mx: "auto" }}
                          />
                          <Skeleton
                            variant="text"
                            width="60%"
                            height={16}
                            sx={{ mx: "auto", mt: 0.5 }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Description skeleton */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={24}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={20}
                    sx={{ mt: 0.5 }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Actions skeleton */}
            <Box className="profil-actions">
              <Skeleton
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSkeleton;

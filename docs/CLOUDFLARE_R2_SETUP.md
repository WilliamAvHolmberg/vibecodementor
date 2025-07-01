# 🌥️ Cloudflare R2 Setup Guide

This guide helps you set up and test the Cloudflare R2 integration with real credentials.

## 📋 Prerequisites

1. **Cloudflare Account** with R2 enabled
2. **R2 Bucket** created
3. **API Token** with R2 permissions

## 🔑 Step 1: Create R2 API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2**
2. Click **Manage API tokens** 
3. Click **Create Token**
4. Choose **Object Read & Write** permissions
5. Select your bucket(s) or leave empty for all buckets
6. Copy the **Access Key ID** and **Secret Access Key**

## 🪣 Step 2: Configure R2 Settings

Update your `appsettings.Development.json`:

```json
{
  "FileStorage": {
    "Provider": "R2",
    "LocalPath": "uploads",
    "R2": {
      "AccountId": "your-actual-account-id",
      "AccessKey": "your-actual-access-key",
      "SecretKey": "your-actual-secret-key", 
      "BucketName": "your-actual-bucket-name",
      "PublicUrl": ""
    }
  }
}
```

### Finding Your Account ID
1. Go to Cloudflare Dashboard → **R2**
2. Your Account ID is shown in the right sidebar

### Creating a Bucket
1. Go to **R2** → **Create bucket**
2. Choose a unique name (e.g., `my-app-storage`)
3. Select your preferred location

## 🧪 Step 3: Test the Integration

### Option A: Run Integration Tests
```bash
# Run R2-specific tests
dotnet test --filter "CloudflareR2Tests" --verbosity normal

# Run file upload API tests  
dotnet test --filter "UploadFile_ViaAPI" --verbosity normal
```

### Option B: Manual API Testing

1. **Start the API:**
   ```bash
   dotnet run
   ```

2. **Test file upload via Swagger:**
   - Go to `https://localhost:7071/swagger`
   - Authenticate (POST `/api/auth/register` then `/api/auth/login`)
   - Use the Bearer token in the "Authorize" button
   - Try POST `/api/files/upload` with a test file

3. **Test file upload via curl:**
   ```bash
   # First get a token
   curl -X POST "https://localhost:7071/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"TestPassword123!"}'

   curl -X POST "https://localhost:7071/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPassword123!"}'

   # Use the token to upload a file
   curl -X POST "https://localhost:7071/api/files/upload" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -F "file=@test-file.txt"
   ```

## ✅ Expected Results

When R2 is working correctly, you should see:

### In Logs:
```
🌥️ Cloudflare R2 storage service initialized for bucket: your-bucket-name
☁️ Uploading file to R2: uploads/20250101_120000_test-file.txt
✅ File uploaded successfully to R2: uploads/20250101_120000_test-file.txt (ETag: "abc123...")
```

### In API Response:
```json
{
  "filePath": "uploads/20250101_120000_test-file.txt", 
  "fileUrl": "https://your-account-id.r2.cloudflarestorage.com/your-bucket/uploads/20250101_120000_test-file.txt",
  "fileName": "test-file.txt",
  "fileSize": 1234,
  "message": "File uploaded successfully to offline storage! 🚀"
}
```

### In R2 Dashboard:
- Go to **R2** → **Your Bucket**
- You should see the uploaded files in the `uploads/` folder

## 🔧 Troubleshooting

### Error: "R2 AccountId is required"
- Check your `appsettings.Development.json` configuration
- Ensure `FileStorage:Provider` is set to `"R2"`

### Error: "Access Denied" 
- Verify your Access Key and Secret Key are correct
- Check that your API token has the right permissions
- Ensure the bucket name matches exactly

### Error: "Bucket not found"
- Verify the bucket exists in your R2 dashboard
- Check the bucket name spelling
- Ensure you're using the correct Account ID

### Tests are Skipping
- This is normal when `Provider` is set to `"Local"`  
- Change to `"R2"` to run actual R2 tests

## 🚀 Next Steps

Once R2 is working:
1. **Set up presigned URLs** for direct client uploads
2. **Configure CORS** if needed for browser uploads  
3. **Add CDN integration** for fast global delivery
4. **Set up lifecycle rules** for automatic file cleanup 
# Hackathon Utils API Integration

## Overview
The Hackathon Utils API provides additional utility functions for the hackathon admin interface, including data export, certificate generation, and email communication features.

## API Endpoints

### Base URL
```
https://4rw3j8fkuj.execute-api.us-east-1.amazonaws.com/utils
```

### Available Endpoints

#### 1. Export Data
**Endpoint:** `GET /export`

**Parameters:**
- `format`: Export format (`csv`, `excel`, `pdf`)
- `status`: Filter by registration status (optional)
- `team_size`: Filter by team size (optional)

**Response:** File download (CSV/Excel/PDF)

#### 2. Generate Certificate
**Endpoint:** `POST /generate-certificate`

**Body:**
```json
{
  "registration_id": "string",
  "certificate_type": "participation|winner|completion"
}
```

**Response:** PDF certificate file

#### 3. Send Emails
**Endpoint:** `POST /send-email`

**Body:**
```json
{
  "recipients": ["registration_id1", "registration_id2"],
  "email_type": "confirmation|reminder|announcement|certificate",
  "custom_data": {
    "custom_message": "Optional custom message"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emails sent: 2 successful, 0 failed",
  "data": {
    "successful_sends": [...],
    "failed_sends": [...]
  }
}
```

## Frontend Integration

### New Features Added

#### 1. Export Functionality
- **Location:** Registration Management section
- **Features:**
  - Export as CSV, Excel, or PDF
  - Respects current filters
  - Real-time download with progress indication

#### 2. Email System
- **Location:** Registration Management section
- **Features:**
  - Bulk email sending to selected registrations
  - Multiple email types (confirmation, reminder, announcement, certificate)
  - Custom message support
  - Modal interface for email composition

#### 3. Certificate Generation
- **Location:** Registration detail modal
- **Features:**
  - Generate certificates for individual participants
  - Support for different certificate types
  - Automatic PDF download

### UI Components

#### Export Buttons
```jsx
<button 
  onClick={() => handleExport('csv')} 
  disabled={isExporting}
  className="btn-export"
>
  {isExporting ? '⏳' : '📄'} Export CSV
</button>
```

#### Email Modal
- Responsive design
- Email type selection
- Custom message input
- Recipient count display

#### Registration Detail Modal
- Added utilities section
- Certificate generation button
- Email action buttons

### Service Integration

#### hackathonService.js Updates
New methods added:
- `exportRegistrations(format, filters)`
- `generateCertificate(registrationId, certificateType)`
- `sendEmail(recipients, emailType, customData)`
- `sendBulkEmails(registrationIds, emailType, customMessage)`

### Error Handling
- Comprehensive error messages
- Loading states for all operations
- User-friendly notifications
- Timeout handling for long operations

### Mobile Responsiveness
- Mobile-first design for all new components
- Responsive export buttons
- Mobile-optimized email modal
- Touch-friendly interfaces

## Backend Requirements

### AWS Services Used
- **Lambda:** Main processing
- **DynamoDB:** Registration data storage
- **SES:** Email sending
- **S3:** File storage (if needed)

### Environment Variables
```
VITE_HACKATHON_UTILS_API_URL=https://4rw3j8fkuj.execute-api.us-east-1.amazonaws.com/utils
```

### Security
- Firebase Authentication required
- JWT token validation
- CORS headers properly configured
- Input validation and sanitization

## Usage Examples

### Export Data
```javascript
// Export CSV with current filters
await hackathonService.exportRegistrations('csv', {
  status: 'confirmed',
  team_size: 'team'
});
```

### Send Bulk Emails
```javascript
// Send announcement to selected registrations
await hackathonService.sendBulkEmails(
  selectedRegistrationIds, 
  'announcement', 
  'Important update about the hackathon schedule.'
);
```

### Generate Certificate
```javascript
// Generate participation certificate
await hackathonService.generateCertificate(
  'REG_12345', 
  'participation'
);
```

## Styling

### CSS Classes
- `.btn-export`: Export button styling
- `.btn-email`: Email button styling
- `.btn-utility`: Utility action buttons
- `.email-modal`: Email modal container
- `.export-actions`: Export button container

### Responsive Breakpoints
- Mobile: `max-width: 768px`
- Small mobile: `max-width: 480px`

## Future Enhancements

### Potential Additions
1. **Advanced Filtering:** More export filter options
2. **Email Templates:** Pre-defined email templates
3. **Bulk Certificate Generation:** Generate certificates for multiple participants
4. **Analytics Export:** Export detailed analytics data
5. **Scheduled Emails:** Schedule emails for future delivery

### Performance Optimizations
1. **Streaming Exports:** For large datasets
2. **Background Processing:** Long-running operations
3. **Caching:** Frequently requested data
4. **Pagination:** For email recipient lists

## Troubleshooting

### Common Issues
1. **Export Timeout:** Reduce data size or implement pagination
2. **Email Failures:** Check SES configuration and recipient validity
3. **Certificate Generation:** Ensure PDF libraries are properly configured
4. **CORS Issues:** Verify API Gateway CORS settings

### Debug Tips
- Check browser console for detailed error messages
- Verify network requests in developer tools
- Check Lambda logs for backend errors
- Validate environment variables

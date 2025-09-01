# CodeKurukshetra Email & Notifications System

## Overview

This document outlines the email and notification system for CodeKurukshetra hackathon. We'll use AWS SES (Simple Email Service) as the primary email provider with SendGrid as a backup option.

## Email Service Architecture

### Primary: AWS SES
- **Reason**: Better AWS integration, cost-effective, reliable
- **Domain**: hackathon@codetapasya.com
- **Region**: ap-south-1 (Mumbai)
- **Daily Send Limit**: 200 emails/day (initially, can be increased)

### Backup: SendGrid
- **Reason**: Higher deliverability, advanced analytics
- **API**: SendGrid v3 API
- **Templates**: Dynamic templates with substitutions

### Email Infrastructure
```
Application (Go) → Email Service (SES/SendGrid) → Recipients
                ↓
            Bounce/Complaint Handling
                ↓
            Update Database Status
```

## Email Templates

### 1. Registration Confirmation Email

#### Template: `registration-confirmation`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to CodeKurukshetra!</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #7B241C, #FF8C00); padding: 2rem; text-align: center; }
        .logo { color: white; font-size: 2rem; font-weight: bold; }
        .content { padding: 2rem; background: #f9f9f9; }
        .team-details { background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; }
        .member { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
        .footer { background: #333; color: white; padding: 1rem; text-align: center; }
        .cta-button { background: #7B241C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚔️ CodeKurukshetra</div>
            <h2 style="color: white; margin: 0;">Registration Confirmed!</h2>
        </div>
        
        <div class="content">
            <h3>Welcome to the Battle, {{team_leader_name}}!</h3>
            <p>Your team <strong>"{{team_name}}"</strong> has been successfully registered for CodeKurukshetra. Get ready for an epic 48-hour coding battle!</p>
            
            <div class="team-details">
                <h4>Team Details</h4>
                <p><strong>Team Name:</strong> {{team_name}}</p>
                <p><strong>Track:</strong> {{track}}</p>
                <p><strong>Registration ID:</strong> {{team_id}}</p>
                <p><strong>Payment Status:</strong> ✅ Confirmed</p>
                
                <h5>Team Members:</h5>
                {{#each members}}
                <div class="member">
                    <strong>{{first_name}} {{last_name}}</strong> {{#if is_leader}}(Leader){{/if}}<br>
                    {{email}} | {{college}}
                </div>
                {{/each}}
            </div>
            
            <h4>What's Next?</h4>
            <ul>
                <li>Join our Discord server for updates: <a href="{{discord_link}}">{{discord_link}}</a></li>
                <li>Follow event updates on social media</li>
                <li>Prepare your development environment</li>
                <li>Review hackathon rules and guidelines</li>
            </ul>
            
            <a href="{{dashboard_url}}" class="cta-button">Access Your Dashboard</a>
        </div>
        
        <div class="footer">
            <p>Event Date: {{event_date}} | Venue: {{venue}}</p>
            <p>Contact: hackathon@codetapasya.com | +91-XXXXXXXXXX</p>
            <p>© 2025 CodeTapasya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### 2. Payment Failed Email

#### Template: `payment-failed`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Failed - CodeKurukshetra</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚔️ CodeKurukshetra</div>
            <h2 style="color: #e74c3c;">Payment Failed</h2>
        </div>
        
        <div class="content">
            <h3>Hi {{team_leader_name}},</h3>
            <p>We encountered an issue processing the payment for your team <strong>"{{team_name}}"</strong>.</p>
            
            <div style="background: #ffebee; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                <h4>Payment Details:</h4>
                <p><strong>Amount:</strong> ₹999</p>
                <p><strong>Transaction ID:</strong> {{transaction_id}}</p>
                <p><strong>Failure Reason:</strong> {{failure_reason}}</p>
            </div>
            
            <p>Don't worry! You can retry the payment using the link below:</p>
            <a href="{{retry_payment_url}}" class="cta-button">Retry Payment</a>
            
            <p><small>This registration will be held for 24 hours. After that, you'll need to register again.</small></p>
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at hackathon@codetapasya.com</p>
        </div>
    </div>
</body>
</html>
```

### 3. Event Reminder Email

#### Template: `event-reminder`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CodeKurukshetra Starts Tomorrow!</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚔️ CodeKurukshetra</div>
            <h2 style="color: white;">The Battle Begins Soon!</h2>
        </div>
        
        <div class="content">
            <h3>Hi {{team_leader_name}},</h3>
            <p>CodeKurukshetra starts in {{hours_remaining}} hours! Are you ready for the ultimate coding battle?</p>
            
            <div class="team-details">
                <h4>📅 Event Schedule</h4>
                <p><strong>Date:</strong> {{event_date}}</p>
                <p><strong>Time:</strong> {{event_time}}</p>
                <p><strong>Venue:</strong> {{venue}}</p>
                <p><strong>Duration:</strong> 48 Hours</p>
            </div>
            
            <h4>🎒 What to Bring:</h4>
            <ul>
                <li>Laptop with development environment setup</li>
                <li>Chargers and necessary cables</li>
                <li>Government-issued ID for verification</li>
                <li>This confirmation email (digital or printed)</li>
            </ul>
            
            <h4>📋 Important Links:</h4>
            <ul>
                <li><a href="{{rules_url}}">Hackathon Rules & Guidelines</a></li>
                <li><a href="{{discord_url}}">Discord Server</a></li>
                <li><a href="{{resources_url}}">Resources & APIs</a></li>
                <li><a href="{{venue_map_url}}">Venue Map & Directions</a></li>
            </ul>
            
            <a href="{{check_in_url}}" class="cta-button">Pre-Check In</a>
        </div>
        
        <div class="footer">
            <p>See you at the battlefield! 🚀</p>
            <p>Team CodeTapasya</p>
        </div>
    </div>
</body>
</html>
```

### 4. Team Onboarding Email

#### Template: `team-onboarding`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Prepare for CodeKurukshetra Battle</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚔️ CodeKurukshetra</div>
            <h2 style="color: white;">Prepare for Battle</h2>
        </div>
        
        <div class="content">
            <h3>Greetings Warriors of Team "{{team_name}}"!</h3>
            <p>The great battle approaches. Here's everything you need to prepare for CodeKurukshetra:</p>
            
            <div class="team-details">
                <h4>🛡️ Battle Preparation Guide</h4>
                
                <h5>Technical Setup:</h5>
                <ul>
                    <li>Install your preferred IDE/Code Editor</li>
                    <li>Set up Git and create GitHub repositories</li>
                    <li>Install Node.js, Python, or your preferred runtime</li>
                    <li>Test your development environment</li>
                </ul>
                
                <h5>Recommended Tools:</h5>
                <ul>
                    <li><strong>Frontend:</strong> React, Vue, Angular, Vite</li>
                    <li><strong>Backend:</strong> Node.js, Python, Go, Java</li>
                    <li><strong>Database:</strong> MongoDB, PostgreSQL, Firebase</li>
                    <li><strong>Cloud:</strong> AWS, Vercel, Netlify</li>
                </ul>
                
                <h5>APIs & Resources:</h5>
                <ul>
                    <li>Public APIs directory: <a href="{{apis_url}}">{{apis_url}}</a></li>
                    <li>Free tier cloud services</li>
                    <li>Open source libraries and frameworks</li>
                </ul>
            </div>
            
            <h4>📚 Learning Resources:</h4>
            <ul>
                <li><a href="{{track_resources_url}}">{{track}} Track Resources</a></li>
                <li><a href="{{tutorial_url}}">Quick Start Tutorials</a></li>
                <li><a href="{{inspiration_url}}">Project Ideas & Inspiration</a></li>
            </ul>
            
            <h4>🎯 Tracks Available:</h4>
            <ul>
                <li>🤖 AI & Machine Learning</li>
                <li>💻 Web & Mobile Development</li>
                <li>⛓️ Blockchain & Web3</li>
                <li>🔧 IoT & Hardware</li>
                <li>🌍 Social Impact</li>
                <li>💡 Open Innovation</li>
            </ul>
            
            <a href="{{team_dashboard_url}}" class="cta-button">Team Dashboard</a>
        </div>
        
        <div class="footer">
            <p>May the best code win! ⚔️</p>
            <p>Team CodeTapasya</p>
        </div>
    </div>
</body>
</html>
```

### 5. Admin Notification Email

#### Template: `admin-notification`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Registration - CodeKurukshetra</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Team Registration</h2>
        <p>A new team has registered for CodeKurukshetra:</p>
        
        <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Team Name:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{team_name}}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Track:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{track}}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Payment Status:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{payment_status}}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Members:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{member_count}}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Registration Time:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{{registration_time}}</td>
            </tr>
        </table>
        
        <p><a href="{{admin_dashboard_url}}">View in Admin Dashboard</a></p>
    </div>
</body>
</html>
```

## Email Service Implementation

### AWS SES Configuration
```go
package email

import (
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/ses"
)

type SESService struct {
    client *ses.SES
    fromEmail string
}

func NewSESService() *SESService {
    sess := session.Must(session.NewSession(&aws.Config{
        Region: aws.String("ap-south-1"),
    }))
    
    return &SESService{
        client: ses.New(sess),
        fromEmail: "hackathon@codetapasya.com",
    }
}

func (s *SESService) SendTemplatedEmail(template string, to []string, data map[string]interface{}) error {
    templateData, err := json.Marshal(data)
    if err != nil {
        return err
    }
    
    input := &ses.SendTemplatedEmailInput{
        Source: aws.String(s.fromEmail),
        Destination: &ses.Destination{
            ToAddresses: aws.StringSlice(to),
        },
        Template: aws.String(template),
        TemplateData: aws.String(string(templateData)),
    }
    
    _, err = s.client.SendTemplatedEmail(input)
    return err
}
```

### SendGrid Backup Service
```go
type SendGridService struct {
    client *sendgrid.Client
    fromEmail string
}

func NewSendGridService() *SendGridService {
    return &SendGridService{
        client: sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY")),
        fromEmail: "hackathon@codetapasya.com",
    }
}

func (s *SendGridService) SendTemplatedEmail(templateID string, to []string, data map[string]interface{}) error {
    from := mail.NewEmail("CodeKurukshetra", s.fromEmail)
    
    m := mail.NewV3Mail()
    m.SetFrom(from)
    m.SetTemplateID(templateID)
    
    p := mail.NewPersonalization()
    for _, email := range to {
        p.AddTos(mail.NewEmail("", email))
    }
    
    for key, value := range data {
        p.SetDynamicTemplateData(key, value)
    }
    
    m.AddPersonalizations(p)
    
    _, err := s.client.Send(m)
    return err
}
```

### Email Manager (Fallback Logic)
```go
type EmailManager struct {
    primary EmailService
    backup  EmailService
}

type EmailService interface {
    SendTemplatedEmail(template string, to []string, data map[string]interface{}) error
}

func (em *EmailManager) SendEmail(template string, to []string, data map[string]interface{}) error {
    // Try primary service (SES)
    err := em.primary.SendTemplatedEmail(template, to, data)
    if err == nil {
        return nil
    }
    
    // Log primary failure and try backup
    log.Printf("Primary email service failed: %v, trying backup", err)
    
    return em.backup.SendTemplatedEmail(template, to, data)
}
```

## Email Workflows

### 1. Registration Flow
```go
func handleTeamRegistration(teamData TeamData) error {
    // 1. Create team and members in database
    teamID, err := createTeam(teamData)
    if err != nil {
        return err
    }
    
    // 2. Create payment order
    orderID, err := createPaymentOrder(teamID, 99900)
    if err != nil {
        return err
    }
    
    // 3. Send confirmation email after payment
    // This happens in webhook handler after payment success
    
    return nil
}

func handlePaymentSuccess(paymentData PaymentData) error {
    // 1. Update payment status
    err := updatePaymentStatus(paymentData.TeamID, "paid")
    if err != nil {
        return err
    }
    
    // 2. Send confirmation email
    team, err := getTeamDetails(paymentData.TeamID)
    if err != nil {
        return err
    }
    
    emailData := map[string]interface{}{
        "team_name": team.Name,
        "team_leader_name": team.Leader.FirstName,
        "team_id": team.ID,
        "track": team.Track,
        "members": team.Members,
        "event_date": "September 20-22, 2025",
        "venue": "TBD",
        "dashboard_url": fmt.Sprintf("https://codetapasya.com/hackathon/team/%s", team.ID),
        "discord_link": "https://discord.gg/codekurukshetra",
    }
    
    // Send to team leader
    err = emailManager.SendEmail("registration-confirmation", []string{team.Leader.Email}, emailData)
    if err != nil {
        log.Printf("Failed to send confirmation email: %v", err)
    }
    
    // Send to all team members
    for _, member := range team.Members {
        if member.Email != team.Leader.Email {
            go emailManager.SendEmail("registration-confirmation", []string{member.Email}, emailData)
        }
    }
    
    // Send admin notification
    adminData := map[string]interface{}{
        "team_name": team.Name,
        "track": team.Track,
        "payment_status": "paid",
        "member_count": len(team.Members),
        "registration_time": time.Now().Format("2006-01-02 15:04:05"),
        "admin_dashboard_url": "https://admin.codetapasya.com/hackathon/teams",
    }
    
    go emailManager.SendEmail("admin-notification", []string{"admin@codetapasya.com"}, adminData)
    
    return nil
}
```

### 2. Reminder System
```go
func scheduleReminders() {
    // Schedule reminder emails
    eventDate := time.Date(2025, 9, 20, 10, 0, 0, 0, time.UTC)
    
    // 48 hours before
    reminderTime48h := eventDate.Add(-48 * time.Hour)
    scheduler.Schedule(reminderTime48h, func() {
        sendReminderEmails("48 hours")
    })
    
    // 24 hours before
    reminderTime24h := eventDate.Add(-24 * time.Hour)
    scheduler.Schedule(reminderTime24h, func() {
        sendReminderEmails("24 hours")
    })
    
    // 2 hours before
    reminderTime2h := eventDate.Add(-2 * time.Hour)
    scheduler.Schedule(reminderTime2h, func() {
        sendReminderEmails("2 hours")
    })
}

func sendReminderEmails(timeRemaining string) {
    teams, err := getAllRegisteredTeams()
    if err != nil {
        log.Printf("Failed to get teams for reminder: %v", err)
        return
    }
    
    for _, team := range teams {
        emailData := map[string]interface{}{
            "team_leader_name": team.Leader.FirstName,
            "team_name": team.Name,
            "hours_remaining": timeRemaining,
            "event_date": "September 20, 2025",
            "event_time": "10:00 AM IST",
            "venue": "TBD",
            "rules_url": "https://codetapasya.com/hackathon/rules",
            "discord_url": "https://discord.gg/codekurukshetra",
            "resources_url": "https://codetapasya.com/hackathon/resources",
            "venue_map_url": "https://maps.google.com/...",
            "check_in_url": fmt.Sprintf("https://codetapasya.com/hackathon/checkin/%s", team.ID),
        }
        
        go emailManager.SendEmail("event-reminder", []string{team.Leader.Email}, emailData)
    }
}
```

## Email Analytics & Monitoring

### Bounce & Complaint Handling
```go
func handleBounce(bounceData BounceData) {
    // Update email status in database
    updateEmailStatus(bounceData.Email, "bounced")
    
    // Log for investigation
    log.Printf("Email bounced: %s, reason: %s", bounceData.Email, bounceData.Reason)
    
    // If hard bounce, mark email as invalid
    if bounceData.Type == "Permanent" {
        markEmailInvalid(bounceData.Email)
    }
}

func handleComplaint(complaintData ComplaintData) {
    // Mark email as complained
    updateEmailStatus(complaintData.Email, "complained")
    
    // Add to suppression list
    addToSuppressionList(complaintData.Email)
    
    log.Printf("Spam complaint: %s", complaintData.Email)
}
```

### Email Metrics
```go
type EmailMetrics struct {
    Sent        int     `json:"sent"`
    Delivered   int     `json:"delivered"`
    Bounced     int     `json:"bounced"`
    Complained  int     `json:"complained"`
    Opened      int     `json:"opened"`
    Clicked     int     `json:"clicked"`
    DeliveryRate float64 `json:"delivery_rate"`
    OpenRate    float64 `json:"open_rate"`
    ClickRate   float64 `json:"click_rate"`
}

func getEmailMetrics(startDate, endDate time.Time) EmailMetrics {
    // Query database for email statistics
    // Calculate rates and return metrics
}
```

## Testing & Quality Assurance

### Email Testing
```go
func TestEmailTemplates(t *testing.T) {
    testData := map[string]interface{}{
        "team_name": "Test Warriors",
        "team_leader_name": "John Doe",
        "team_id": "test-team-123",
        "track": "AI & ML",
        "members": []Member{
            {FirstName: "John", LastName: "Doe", Email: "john@test.com", IsLeader: true},
            {FirstName: "Jane", LastName: "Smith", Email: "jane@test.com", IsLeader: false},
        },
    }
    
    // Test email rendering
    err := emailManager.SendEmail("registration-confirmation", []string{"test@codetapasya.com"}, testData)
    assert.NoError(t, err)
}
```

### A/B Testing
```go
func sendABTestEmail(template string, to []string, data map[string]interface{}) {
    // Split recipients into groups
    groupA := to[:len(to)/2]
    groupB := to[len(to)/2:]
    
    // Send variant A
    go emailManager.SendEmail(template+"_a", groupA, data)
    
    // Send variant B  
    go emailManager.SendEmail(template+"_b", groupB, data)
}
```

## Best Practices

### Content Guidelines
- Keep subject lines under 50 characters
- Use clear, action-oriented CTAs
- Optimize for mobile viewing
- Include unsubscribe links
- Personalize with recipient names

### Technical Guidelines
- Validate email addresses before sending
- Implement exponential backoff for retries
- Use connection pooling for high volume
- Monitor send rates and quotas
- Handle bounces and complaints

### Compliance
- Include physical address in footer
- Provide unsubscribe mechanism
- Honor opt-out requests within 24 hours
- Maintain suppression lists
- Follow CAN-SPAM and similar regulations

export interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: string
  content: string
}

export const templates: Template[] = [
  {
    id: 'resume',
    name: 'Resume',
    description: 'Professional resume layout',
    category: 'Career',
    icon: 'Briefcase',
    content: `<h1>Alexandra Chen</h1>
<p style="color: #666; font-size: 14px;">San Francisco, CA · alex.chen@email.com · (415) 555-0142 · <a href="#">linkedin.com/in/alexchen</a></p>
<hr>
<h2>Experience</h2>
<h3>Senior Product Designer — Stripe</h3>
<p style="color: #666; font-size: 13px;">Jan 2021 – Present · San Francisco, CA</p>
<ul>
<li>Led the redesign of Stripe's merchant dashboard, improving task completion rates by 34%</li>
<li>Managed a team of 4 designers across 3 product verticals</li>
<li>Established and maintained the design system used by 120+ engineers</li>
</ul>
<h3>Product Designer — Figma</h3>
<p style="color: #666; font-size: 13px;">Jun 2018 – Dec 2020 · San Francisco, CA</p>
<ul>
<li>Designed core collaboration features including real-time commenting and version history</li>
<li>Conducted 50+ user research sessions to inform product strategy</li>
<li>Shipped 12 major features that contributed to 40% YoY user growth</li>
</ul>
<h2>Education</h2>
<h3>Master of Fine Arts — Rhode Island School of Design</h3>
<p style="color: #666; font-size: 13px;">2016 – 2018 · Graphic Design</p>
<h3>Bachelor of Arts — UC Berkeley</h3>
<p style="color: #666; font-size: 13px;">2012 – 2016 · Art Practice, Magna Cum Laude</p>
<h2>Skills</h2>
<p>Figma, Sketch, Adobe Creative Suite, Framer, Principle, HTML/CSS, JavaScript, React, Design Systems, User Research, Prototyping</p>`,
  },
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Clean business invoice',
    category: 'Business',
    icon: 'Receipt',
    content: `<h1 style="text-align: right;">INVOICE</h1>
<p style="text-align: right; color: #666;">Invoice #INV-2024-0042<br>Date: January 15, 2024<br>Due: February 15, 2024</p>
<hr>
<table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
<tr><td style="border: none; padding: 8px 0; vertical-align: top;"><strong>From:</strong><br>Studio Meridian LLC<br>123 Design Avenue<br>Brooklyn, NY 11201<br>hello@studio-meridian.com</td><td style="border: none; padding: 8px 0; vertical-align: top;"><strong>Bill To:</strong><br>Acme Corporation<br>456 Business Road<br>New York, NY 10001<br>billing@acme.com</td></tr>
</table>
<table style="width: 100%; border-collapse: collapse; margin: 1.5em 0;">
<thead>
<tr style="border-bottom: 2px solid #1a1a2e;">
<th style="text-align: left; padding: 10px 8px; font-weight: 600;">Description</th>
<th style="text-align: center; padding: 10px 8px; font-weight: 600;">Qty</th>
<th style="text-align: right; padding: 10px 8px; font-weight: 600;">Rate</th>
<th style="text-align: right; padding: 10px 8px; font-weight: 600;">Amount</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom: 1px solid #e0e0e0;">
<td style="padding: 10px 8px;">Brand Identity Design</td>
<td style="text-align: center; padding: 10px 8px;">1</td>
<td style="text-align: right; padding: 10px 8px;">$5,000.00</td>
<td style="text-align: right; padding: 10px 8px;">$5,000.00</td>
</tr>
<tr style="border-bottom: 1px solid #e0e0e0;">
<td style="padding: 10px 8px;">Website Redesign (12 pages)</td>
<td style="text-align: center; padding: 10px 8px;">1</td>
<td style="text-align: right; padding: 10px 8px;">$8,500.00</td>
<td style="text-align: right; padding: 10px 8px;">$8,500.00</td>
</tr>
<tr style="border-bottom: 1px solid #e0e0e0;">
<td style="padding: 10px 8px;">Design System Documentation</td>
<td style="text-align: center; padding: 10px 8px;">1</td>
<td style="text-align: right; padding: 10px 8px;">$2,500.00</td>
<td style="text-align: right; padding: 10px 8px;">$2,500.00</td>
</tr>
<tr style="border-bottom: 1px solid #e0e0e0;">
<td style="padding: 10px 8px;">Revisions & Consultations</td>
<td style="text-align: center; padding: 10px 8px;">8 hrs</td>
<td style="text-align: right; padding: 10px 8px;">$150.00</td>
<td style="text-align: right; padding: 10px 8px;">$1,200.00</td>
</tr>
</tbody>
</table>
<table style="width: 50%; margin-left: auto; border-collapse: collapse;">
<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Subtotal</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #e0e0e0;">$17,200.00</td></tr>
<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">Tax (8.875%)</td><td style="text-align: right; padding: 8px; border-bottom: 1px solid #e0e0e0;">$1,526.50</td></tr>
<tr><td style="padding: 10px 8px; font-weight: 700; font-size: 1.1em;">Total Due</td><td style="text-align: right; padding: 10px 8px; font-weight: 700; font-size: 1.1em;">$18,726.50</td></tr>
</table>
<hr>
<p style="text-align: center; color: #666; font-size: 13px;">Payment terms: Net 30 days. Please include invoice number with payment.<br>Bank: Chase · Account: ****4821 · Routing: 021000021</p>`,
  },
  {
    id: 'report',
    name: 'Report',
    description: 'Structured business report',
    category: 'Corporate',
    icon: 'FileText',
    content: `<h1>Q4 2024 Performance Report</h1>
<p style="color: #666; font-size: 13px;">Prepared by Strategy & Analytics Division · December 2024</p>
<hr>
<h2>Executive Summary</h2>
<p>This report provides a comprehensive analysis of organizational performance during Q4 2024. Key metrics indicate strong growth across all major business units, with particular strength in the enterprise segment. Revenue exceeded projections by 12%, driven primarily by the successful launch of the new platform.</p>
<h2>Key Metrics</h2>
<table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
<thead>
<tr style="border-bottom: 2px solid #1a1a2e;">
<th style="text-align: left; padding: 10px 8px;">Metric</th>
<th style="text-align: right; padding: 10px 8px;">Q3 2024</th>
<th style="text-align: right; padding: 10px 8px;">Q4 2024</th>
<th style="text-align: right; padding: 10px 8px;">Change</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px 8px;">Total Revenue</td><td style="text-align: right; padding: 10px 8px;">$12.4M</td><td style="text-align: right; padding: 10px 8px;">$14.8M</td><td style="text-align: right; padding: 10px 8px; color: #4a7c59;">+19.4%</td></tr>
<tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px 8px;">Active Users</td><td style="text-align: right; padding: 10px 8px;">84,200</td><td style="text-align: right; padding: 10px 8px;">98,500</td><td style="text-align: right; padding: 10px 8px; color: #4a7c59;">+17.0%</td></tr>
<tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px 8px;">Customer Retention</td><td style="text-align: right; padding: 10px 8px;">91.2%</td><td style="text-align: right; padding: 10px 8px;">93.7%</td><td style="text-align: right; padding: 10px 8px; color: #4a7c59;">+2.5%</td></tr>
<tr style="border-bottom: 1px solid #e0e0e0;"><td style="padding: 10px 8px;">NPS Score</td><td style="text-align: right; padding: 10px 8px;">62</td><td style="text-align: right; padding: 10px 8px;">71</td><td style="text-align: right; padding: 10px 8px; color: #4a7c59;">+14.5%</td></tr>
</tbody>
</table>
<h2>Business Unit Performance</h2>
<h3>Enterprise Division</h3>
<p>The enterprise segment delivered record results, closing 47 new deals with an average contract value of $185K. The pipeline grew by 28% quarter-over-quarter, positioning us strongly for Q1 2025. Notable wins include partnerships with three Fortune 500 companies.</p>
<h3>Consumer Products</h3>
<p>Consumer product revenue grew 15% driven by the premium tier launch. Monthly active users increased to 2.1M, with a 23% improvement in engagement metrics. The mobile app achieved a 4.8-star rating across app stores.</p>
<h2>Strategic Initiatives</h2>
<ol>
<li><strong>AI Integration:</strong> Completed Phase 1 deployment of AI-powered analytics across all products, resulting in 40% faster insight generation for customers.</li>
<li><strong>International Expansion:</strong> Launched in 3 new European markets (Germany, France, Netherlands), contributing $1.2M in incremental revenue.</li>
<li><strong>Platform Modernization:</strong> Migrated 78% of infrastructure to cloud-native architecture, reducing operational costs by 22%.</li>
</ol>
<h2>Outlook & Recommendations</h2>
<p>Based on current trajectory and market conditions, we project continued strong performance in Q1 2025. We recommend accelerating the AI integration timeline and expanding the international team to capitalize on the European growth opportunity.</p>
<hr>
<p style="color: #666; font-size: 13px; text-align: center;"><em>Confidential — For internal distribution only</em></p>`,
  },
]

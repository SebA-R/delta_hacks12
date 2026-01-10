import Link from "next/link"
import { ArrowLeft, Target, Users, Phone, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-foreground">ConnectMD</h1>
            <Link href="/">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            AI-Driven System for Real-Time Family Doctor Discovery
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Connecting patients with family physicians through intelligent, automated verification
          </p>
        </div>

        {/* Abstract Section */}
        <Card className="mb-8 p-8 bg-white shadow-md">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">About This Project</h3>
            </div>
          </div>
          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              Finding a family doctor remains a major challenge in many healthcare systems, where patients are often
              forced to rely on outdated registries or manually call clinics to determine availability. These workflows
              are inefficient, inaccessible, and do not reflect real-time clinic intake status.
            </p>
            <p>
              This project proposes an <span className="font-semibold text-accent">AI-driven system</span> that
              continuously discovers, verifies, and maintains up-to-date information on family physicians, and exposes
              this information to patients through a clean, searchable web interface.
            </p>
            <p>
              The system combines automated web scraping for physician discovery with outbound AI-powered phone calls,
              using a trained voice agent to verify clinic intake status. Verified information is stored in a
              centralized database, which serves as the authoritative source for patient-facing queries.
            </p>
            <p className="font-semibold">
              Patients interact exclusively with this web interface—allowing them to search, filter, and discover family
              doctors based on real-time availability, location, and preferences—without needing to place phone calls
              themselves.
            </p>
          </div>
        </Card>

        {/* Problem Statement */}
        <Card className="mb-8 p-8 bg-white shadow-md">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-chart-2/10">
              <Users className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">The Problem We're Solving</h3>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Patients searching for a family doctor often face:</h4>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Inaccurate or outdated online listings</li>
                <li>Unclear intake procedures</li>
                <li>The need to repeatedly call clinics for basic information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Meanwhile, clinics experience:</h4>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Being inundated with repetitive calls asking whether they are accepting new patients</li>
                <li>Increased administrative burden</li>
                <li>Time taken away from patient care</li>
              </ul>
            </div>
            <Card className="bg-accent/5 border-accent/20 p-6">
              <h4 className="font-semibold text-accent mb-3">Core Question:</h4>
              <p className="text-foreground text-lg italic leading-relaxed">
                How can we maintain a continuously updated, accurate view of family doctor availability and present it
                to patients in a simple, accessible interface—without requiring patients to interact with clinics
                directly?
              </p>
            </Card>
            <p className="text-foreground">
              This project investigates whether AI voice agents and automated scraping can replace fragmented, manual
              workflows with a centralized, real-time system.
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="mb-8 p-8 bg-white shadow-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-chart-3/10">
              <Database className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">How the System Works</h3>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-secondary border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-semibold text-foreground">Physician Discovery</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automated web scraping discovers physicians from public health directories, clinic websites, and
                business listings.
              </p>
            </Card>

            <Card className="p-6 bg-secondary border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-semibold text-foreground">AI Voice Verification</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI-powered phone calls verify clinic intake status by asking standardized questions and converting
                responses into structured data.
              </p>
            </Card>

            <Card className="p-6 bg-secondary border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-semibold text-foreground">Centralized Database</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Verified information is stored in a centralized database with timestamps reflecting data freshness and
                accuracy.
              </p>
            </Card>

            <Card className="p-6 bg-secondary border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <h4 className="font-semibold text-foreground">Patient Access</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Patients search and filter through this web interface to find available doctors—no phone calls required.
              </p>
            </Card>
          </div>
        </Card>

        {/* Impact Section */}
        <Card className="p-8 bg-gradient-to-br from-accent/5 to-chart-2/5 border-accent/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-white">
              <Phone className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Expected Impact</h3>
            </div>
          </div>
          <div className="space-y-4 text-foreground">
            <p className="leading-relaxed">
              By separating patient interaction from clinic verification, this project introduces a{" "}
              <span className="font-semibold">scalable and respectful approach</span> to family doctor discovery.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-accent mb-2">For Patients</h4>
                <p className="text-sm text-muted-foreground">
                  A clear, up-to-date interface that eliminates the need for repetitive phone calls and reduces the time
                  to find care.
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-chart-2 mb-2">For Clinics</h4>
                <p className="text-sm text-muted-foreground">
                  Reduced administrative burden from repetitive inquiries, allowing staff to focus on patient care.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              Start Searching for Doctors
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

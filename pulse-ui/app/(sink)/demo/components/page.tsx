"use client";

import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Menu,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsPanels,
  TabsTrigger,
  TabsTriggerList,
} from "@/components/retroui";
import { Card } from "@/components/retroui/Card";
import BadgeStyleVariants from "@/preview/components/badge-style-variants";
import TestimonialCard from "@/preview/components/card-style-testimonial";
import { CheckCircle } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <div className="container max-w-6xl mx-auto space-y-6">
      <div className="space-x-4">
        <Button>Default Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="link">Link Button</Button>
      </div>
      <div className="space-x-4">
        <BadgeStyleVariants />
      </div>

      <div className="space-x-4">
        <Checkbox />
        <Checkbox variant="outline" />
        <Checkbox variant="solid" />
        <Checkbox size="sm" />
        <Checkbox size="md" />
        <Checkbox size="lg" />
      </div>

      <div className="space-x-4">
        <Select>
          <Select.Trigger>
            <Select.Value placeholder="Select an option" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Item value="1">Option 1</Select.Item>
              <Select.Item value="2">Option 2</Select.Item>
              <Select.Item value="3">Option 3</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select>
      </div>

      <div className="space-x-4">
        <Switch />
      </div>

      <div className="flex items-center space-x-4">
        <Avatar>
          <Avatar.Image src="/images/avatar.jpeg" alt="Arif Logs" />
          <Avatar.Fallback>AH</Avatar.Fallback>
        </Avatar>

        <Avatar className="rounded-none">
          <Avatar.Image src="/images/avatar.jpeg" alt="Arif Logs" />
          <Avatar.Fallback>AH</Avatar.Fallback>
        </Avatar>

        <Avatar className="rounded-none h-20 w-20">
          <Avatar.Image src="/images/avatar.jpeg" alt="Arif Logs" />
          <Avatar.Fallback>AH</Avatar.Fallback>
        </Avatar>
      </div>
      <div>
        <Tabs>
          <TabsTriggerList>
            <TabsTrigger>Tab 1</TabsTrigger>
            <TabsTrigger>Tab 2</TabsTrigger>
            <TabsTrigger>Tab 3</TabsTrigger>
          </TabsTriggerList>
          <TabsPanels>
            <TabsContent>Content 1</TabsContent>
            <TabsContent>Content 2</TabsContent>
            <TabsContent>Content 3</TabsContent>
          </TabsPanels>
        </Tabs>
      </div>

      <div>
        <Accordion type="single" collapsible>
          <Accordion.Item value="item-1">
            <Accordion.Header>Head...</Accordion.Header>
            <Accordion.Content>Content...</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div>
        <Card>
          <Card.Header>
            <Card.Title>Card Title</Card.Title>
            <Card.Description>Card Description</Card.Description>
          </Card.Header>
        </Card>
      </div>

      <div className="space-y-6">
        <Alert>
          <Alert.Title>Heads up!</Alert.Title>
          <Alert.Description>
            You can add components to your app using the cli.
          </Alert.Description>
        </Alert>

        <Alert variant="solid">
          <Alert.Title>Heads up!</Alert.Title>
          <Alert.Description>
            You can add components to your app using the cli.
          </Alert.Description>
        </Alert>
        <Alert variant="solid" className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-4" />
          <div>
            <Alert.Title>Heads up!</Alert.Title>
          </div>
        </Alert>
      </div>

      <div>
        <Menu>
          <Menu.Trigger asChild>
            <Button>Menu</Button>
          </Menu.Trigger>
          <Menu.Content className="min-w-36">
            <Menu.Item>Menu Item 1</Menu.Item>
            <Menu.Item>Menu Item 2</Menu.Item>
            <Menu.Item>Menu Item 3</Menu.Item>
          </Menu.Content>
        </Menu>
      </div>

      <TestimonialCard />

      <div className="h-36"></div>
    </div>
  );
}

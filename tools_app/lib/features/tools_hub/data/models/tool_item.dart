import 'package:flutter/material.dart';

class ToolItem {
  final String id;
  final String slug;
  final String title;
  final String shortTitle;
  final String tagline;
  final String description;
  final String category;
  final IconData icon;
  final String badge;
  final String status; // active, beta, coming_soon
  final List<String> features;
  final String primaryAction;
  final String benchmarkTime;
  final String statBadge;
  final Color accentColor;

  const ToolItem({
    required this.id,
    required this.slug,
    required this.title,
    required this.shortTitle,
    required this.tagline,
    required this.description,
    required this.category,
    required this.icon,
    required this.badge,
    required this.status,
    required this.features,
    required this.primaryAction,
    required this.benchmarkTime,
    required this.statBadge,
    required this.accentColor,
  });
}


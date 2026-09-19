import 'package:flutter/material.dart';

void main() {
  runApp(const NexTradeApp());
}

class NexTradeApp extends StatelessWidget {
  const NexTradeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NexTrade Mobile',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const NexTradeHomePage(),
    );
  }
}

class NexTradeHomePage extends StatelessWidget {
  const NexTradeHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NexTrade Mobile'),
      ),
      body: const Center(
        child: Text(
          'NexTrade\nMobile\nEnvironment Ready',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
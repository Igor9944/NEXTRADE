import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config/env.dart';
import 'api_exception.dart';
import 'token_store.dart';

class ApiClient {
  ApiClient({
    required this.tokenStore,
    http.Client? httpClient,
    this.baseUrl = AppConfig.apiBaseUrl,
  }) : _http = httpClient ?? http.Client();

  final TokenStore tokenStore;
  final http.Client _http;
  final String baseUrl;

  Future<dynamic> request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = <String, String>{'Content-Type': 'application/json', 'Accept': 'application/json'};
    if (auth) {
      final token = await tokenStore.read();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    http.Response response;
    try {
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) {
        request.body = jsonEncode(body);
      }
      final streamed = await _http.send(request).timeout(AppConfig.requestTimeout);
      response = await http.Response.fromStream(streamed);
    } on TimeoutException {
      throw ApiException(0, 'timeout');
    } on SocketException {
      throw ApiException(0, 'network');
    } on http.ClientException {
      throw ApiException(0, 'network');
    }

    dynamic payload;
    try {
      payload = response.body.isEmpty ? {} : jsonDecode(response.body);
    } catch (_) {
      payload = {};
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = payload is Map
          ? (payload['message'] ?? payload['error'] ?? 'Request failed').toString()
          : 'Request failed';
      throw ApiException(response.statusCode, message);
    }
    return payload;
  }

  Future<dynamic> get(String path, {bool auth = true}) => request('GET', path, auth: auth);
  Future<dynamic> post(String path, {Map<String, dynamic>? body, bool auth = true}) =>
      request('POST', path, body: body, auth: auth);
  Future<dynamic> patch(String path, {Map<String, dynamic>? body, bool auth = true}) =>
      request('PATCH', path, body: body, auth: auth);
  Future<dynamic> delete(String path, {bool auth = true}) => request('DELETE', path, auth: auth);
}

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
public class Cheddar {

     private final String linkRequestJs = "http://localhost:8082/api";
    private final HttpClient client = HttpClient.newHttpClient();
      public String enviarToJs(String jsonPayload) throws IOException, InterruptedException{
        HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(linkRequestJs))
        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
        .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return response.body();
    }
    private String extrairValorJson2(String json, String chave) {
        Pattern pattern = Pattern.compile("\"" + chave + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "";
    }

    public void iniciarServerJava2() throws IOException{
        HttpServer server = HttpServer.create(new InetSocketAddress(4039), 0);
        server.createContext("/javanauta", new HttpHandler () {
            @Override 

          
            public void handle(HttpExchange exchange) throws IOException {
    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

    // Responde imediatamente às requisições preflight OPTIONS do navegador
    if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
        exchange.sendResponseHeaders(204, -1);
        return;
    }

    if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
    

                    String corpoRequisicao;
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                        corpoRequisicao = reader.lines().collect(Collectors.joining("\n"));
                    }
                    String corrente = extrairValorJson2(corpoRequisicao, "corrente");
                    String potencia = extrairValorJson2(corpoRequisicao, "potencia");
                    String temperatura = extrairValorJson2(corpoRequisicao, "temperatura");
                    String umidade = extrairValorJson2(corpoRequisicao, "umidade");
                    String espID = extrairValorJson2(corpoRequisicao, "espID");

                    Esp32 novoUsuario = new Esp32(corrente, potencia, temperatura, umidade, espID);
                    String jsonFinal2 = novoUsuario.toJson2();
                     
                    System.out.println("Enviando para o JavaScript: " + jsonFinal2);
                    
                   try {
    enviarToJs(jsonFinal2); 
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
                    String resposta = "Encaminhado para o JavaScript com sucesso";
                    exchange.sendResponseHeaders(200, resposta.getBytes(StandardCharsets.UTF_8).length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(resposta.getBytes(StandardCharsets.UTF_8));
                    }
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            }
        });
        
        server.setExecutor(null);
        server.start();
        System.out.println("Servidor Java2 rodando na porta 8082...");
    
    }

}
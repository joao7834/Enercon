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

public class Config {
    private final HttpClient client = HttpClient.newHttpClient();
   private final String linkRequest = "http://localhost:8080/api";


    public String enviarToGo(String jsonPayload) throws IOException, InterruptedException{
        HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(linkRequest))
        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
        .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return response.body();
    }

   

    public void iniciarServerJava() throws IOException{
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        server.createContext("/javaA", new HttpHandler () {
            @Override 

          
            public void handle(HttpExchange exchange) throws IOException{
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

               
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(204, -1);
                    return;
                }
                if ("POST".equals(exchange.getRequestMethod())) {
                    String corpoRequisicao;
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
                        corpoRequisicao = reader.lines().collect(Collectors.joining("\n"));
                    }
                    String nome = extrairValorJson(corpoRequisicao, "nome");
                    String email = extrairValorJson(corpoRequisicao, "email");
                    String type = extrairValorJson(corpoRequisicao, "type");

                    User novoUsuario = new User(nome, email, type);
                    String jsonFinal = novoUsuario.toJson();
                     
                    System.out.println("Enviando para o Go: " + jsonFinal);
                    
                   try {
    enviarToGo(jsonFinal); 
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
                    String resposta = "Encaminhado para o Go com sucesso!";
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
        System.out.println("Servidor Java rodando na porta 8081...");
    
    }
    private String extrairValorJson(String json, String chave) {
        Pattern pattern = Pattern.compile("\"" + chave + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "";
    }
}


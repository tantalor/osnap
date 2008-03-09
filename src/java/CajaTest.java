// This code is due in large part to Andrea Campi <http://www.webcom.it>

import com.google.caja.lexer.HtmlTokenType;
import com.google.caja.lexer.InputSource;
import com.google.caja.lexer.ParseException;
import com.google.caja.lexer.TokenQueue;
import com.google.caja.parser.AncestorChain;
import com.google.caja.parser.html.DomParser;
import com.google.caja.parser.html.DomTree;
import com.google.caja.parser.html.OpenElementStack;
import com.google.caja.plugin.HtmlPluginCompiler;
import com.google.caja.plugin.PluginEnvironment;
import com.google.caja.plugin.PluginMeta;
import com.google.caja.reporting.MessageContext;
import com.google.caja.reporting.RenderContext;
import com.google.caja.reporting.SimpleMessageQueue;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;

public class CajaTest {
  
  public static final String NAMESPACE_PREFIX = "";
  public static final String PATH_PREFIX = "";
  
  public static void main(String[] args) throws IOException, URISyntaxException, ParseException
  {
    HtmlPluginCompiler compiler = new HtmlPluginCompiler(
      new SimpleMessageQueue(),
      new PluginMeta(NAMESPACE_PREFIX, PATH_PREFIX, PluginEnvironment.CLOSED_PLUGIN_ENVIRONMENT)
    );
    
    compiler.addInput(new AncestorChain<DomTree>(parseHtml(getInput())));
    
    if (compiler.run())
    {
      System.out.println("output:");
      compiler.getJavascript().render(new RenderContext(new MessageContext(), new OutputStreamWriter(System.out)));
    } else
    {
      System.out.println("Flagrant error.");
    }
  }
  
  public static String getInput() throws IOException
  {
    // read from stdin
    BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
    StringBuffer buffer = new StringBuffer();
    for (String input; (input = reader.readLine()) != null;)
    {
      buffer.append(input); 
    }
    return buffer.toString();
  }
  
  public static DomTree parseHtml(String html) throws URISyntaxException, ParseException
  {
    // convert given html into a DomTree
    System.out.println("input: "+html);
    InputSource input = new InputSource(new URI("content", null, "/" + html, null));
    TokenQueue<HtmlTokenType> queue = DomParser.makeTokenQueue(input, new StringReader(html), false);
    return DomParser.parseFragment(queue, OpenElementStack.Factory.createHtml5ElementStack(new SimpleMessageQueue()));
  } 
}

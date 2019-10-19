#!/usr/bin/env ruby
require 'sinatra'
require 'pry'

set :bind, '0.0.0.0'
set :port, 8081

get '/*' do
  path = Pathname.new("#{Dir.pwd}/root/#{params['splat'].first}")
  case path.to_s.split('.').last
  when 'js'
    content_type 'text/javascript'
  when 'css'
    content_type 'text/css'
  end
  if params["splat"].join.empty?
    redirect "/index.html"
  else
    File.open(path.to_s).read
  end
end
